# Secure GitHub Actions → Cloud Run candidate deployment

This runbook configures GitHub OIDC / Workload Identity Federation (WIF) for the
`cloud-run-candidate.yml` workflow. It deliberately deploys a **tagged,
no-traffic candidate revision**. It does not move production traffic.

## Fixed deployment target

- Google Cloud project: `gen-lang-client-0113378314`
- Project number: `915711496296`
- Cloud Run region: `us-west1`
- Cloud Run service: `ai-banker-transformation-copilot`
- Artifact Registry repository: `us-west1-docker.pkg.dev/gen-lang-client-0113378314/ai-banker-copilot`
- GitHub repository: `strategysamuel/ai-banker-transformation-copilot`
- GitHub workflow: `.github/workflows/cloud-run-candidate.yml`

## 1. Confirm the Google Cloud identities and existing service configuration

Run these commands in Cloud Shell while authenticated as a project administrator:

```bash
gcloud config set project gen-lang-client-0113378314

gcloud run services describe ai-banker-transformation-copilot \
  --region us-west1 \
  --format='yaml(spec.template.spec.serviceAccountName,status.url,status.traffic)'

gcloud artifacts repositories describe ai-banker-copilot \
  --location us-west1
```

Record the Cloud Run runtime service account shown by the first command.
Do not replace it with the GitHub deployment identity.

## 2. Grant the GitHub deployment service account least-privilege roles

The service account created in the console is:

`github-cloud-run-deployer@gen-lang-client-0113378314.iam.gserviceaccount.com`

Grant Artifact Registry write only on the target repository:

```bash
gcloud artifacts repositories add-iam-policy-binding ai-banker-copilot \
  --location us-west1 \
  --member='serviceAccount:github-cloud-run-deployer@gen-lang-client-0113378314.iam.gserviceaccount.com' \
  --role='roles/artifactregistry.writer'
```

Grant Cloud Run deployment permissions at project scope:

```bash
gcloud projects add-iam-policy-binding gen-lang-client-0113378314 \
  --member='serviceAccount:github-cloud-run-deployer@gen-lang-client-0113378314.iam.gserviceaccount.com' \
  --role='roles/run.developer'
```

Grant `roles/iam.serviceAccountUser` on the **runtime service account recorded in step 1**.
Replace the placeholder; do not grant this role on every service account:

```bash
RUNTIME_SA='REPLACE_WITH_RUNTIME_SERVICE_ACCOUNT_EMAIL'
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
  --project gen-lang-client-0113378314 \
  --member='serviceAccount:github-cloud-run-deployer@gen-lang-client-0113378314.iam.gserviceaccount.com' \
  --role='roles/iam.serviceAccountUser'
```

## 3. Create the GitHub-only Workload Identity Federation provider

No service-account key is required or should be created.

```bash
gcloud services enable iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project gen-lang-client-0113378314

gcloud iam workload-identity-pools create github-pool \
  --project gen-lang-client-0113378314 \
  --location global \
  --display-name='GitHub Actions pool'

gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project gen-lang-client-0113378314 \
  --location global \
  --workload-identity-pool github-pool \
  --display-name='Project Compass GitHub provider' \
  --issuer-uri='https://token.actions.githubusercontent.com' \
  --attribute-mapping='google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref' \
  --attribute-condition="assertion.repository == 'strategysamuel/ai-banker-transformation-copilot' && assertion.ref == 'refs/heads/main'"
```

Allow only this repository to impersonate the deployment service account:

```bash
gcloud iam service-accounts add-iam-policy-binding \
  github-cloud-run-deployer@gen-lang-client-0113378314.iam.gserviceaccount.com \
  --project gen-lang-client-0113378314 \
  --role roles/iam.workloadIdentityUser \
  --member='principalSet://iam.googleapis.com/projects/915711496296/locations/global/workloadIdentityPools/github-pool/attribute.repository/strategysamuel/ai-banker-transformation-copilot'
```

Get the provider resource name:

```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --project gen-lang-client-0113378314 \
  --location global \
  --workload-identity-pool github-pool \
  --format='value(name)'
```

## 4. Add GitHub Actions repository variables

In GitHub, open **Settings → Secrets and variables → Actions → Variables**.
Add these repository variables (they are identifiers, not credentials):

| Variable | Value |
|---|---|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full provider resource name printed in step 3 |
| `GCP_DEPLOY_SERVICE_ACCOUNT` | `github-cloud-run-deployer@gen-lang-client-0113378314.iam.gserviceaccount.com` |

The workflow is manually dispatched and uses the GitHub environment
`production-candidate`. Create that environment under **Settings → Environments**.
Keep its deployment protection rules enabled if available.

## 5. Run candidate deployment and verify

Open **Actions → Build and deploy Cloud Run candidate → Run workflow** on
`main`. The workflow:

1. Installs the locked Bun dependencies.
2. Runs TypeScript, Firebase Auth, and Firestore rules tests.
3. Builds the Docker image and tags it with the exact Git commit SHA.
4. Pushes that immutable SHA-tagged image to Artifact Registry.
5. Deploys a new Cloud Run revision using `--no-traffic` and tag
   `github-candidate`.
6. Calls `/api/health` on the candidate URL and records the result.

The workflow does **not** change the percentage of production traffic. The
existing production revision remains available for rollback.

## 6. Explicit release approval

Do not move production traffic automatically. First review the candidate URL,
health response, Cloud Run logs, and application sign-in / protected API flows.
Only after approval should a separate, reviewed change shift traffic.

## Operational cautions

- Do not create or download service-account JSON keys.
- Do not put Gemini API keys, Firebase private credentials, or service-account
  keys in GitHub variables. Keep runtime secrets in Secret Manager.
- The workflow intentionally does not run `gcloud run services update-traffic`.
- Confirm the Cloud Run service's current runtime service account and existing
  Secret Manager bindings before any deployment.
