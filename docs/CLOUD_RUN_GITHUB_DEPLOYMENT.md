# GitHub-controlled Cloud Run deployment

This runbook deliberately separates building/testing from production traffic promotion.
The workflow `.github/workflows/cloud-run-candidate.yml` is manual-only and deploys a
revision tagged `github-candidate` with `--no-traffic`. It does not shift traffic.

## Fixed production target

- Google Cloud project: `gen-lang-client-0113378314`
- Cloud Run service: `ai-banker-transformation-copilot`
- Region: `us-west1`
- Artifact Registry repository: `ai-banker-copilot`
- Runtime: Node.js 22
- Existing public service URL/custom AI Studio domain: preserve current service configuration.

## One-time Google Cloud setup (project administrator)

Use an administrator account in the intended project. Do not create or paste service-account
private keys into GitHub.

1. Enable APIs:
   - Cloud Run Admin API (`run.googleapis.com`)
   - Artifact Registry API (`artifactregistry.googleapis.com`)
   - IAM Credentials API (`iamcredentials.googleapis.com`)
   - Security Token Service API (`sts.googleapis.com`)
2. Create the Artifact Registry Docker repository:
   ```bash
   gcloud artifacts repositories create ai-banker-copilot \
     --repository-format=docker --location=us-west1 \
     --project=gen-lang-client-0113378314
   ```
   If it already exists, verify it is a Docker repository in `us-west1`; do not recreate it.
3. Create a dedicated GitHub deploy service account. Grant only:
   - `roles/artifactregistry.writer` on the `ai-banker-copilot` repository.
   - `roles/run.developer` on the project (or narrower service-level equivalent).
   - `roles/iam.serviceAccountUser` on the existing Cloud Run runtime service account.
4. Configure Workload Identity Federation for this GitHub repository:
   - Create a Workload Identity Pool and OIDC provider for `https://token.actions.githubusercontent.com`.
   - Restrict the provider condition to repository `strategysamuel/ai-banker-transformation-copilot`.
   - Allow that repository principal to impersonate the deploy service account using `roles/iam.workloadIdentityUser`.
   - Restrict the trust to the `production-candidate` GitHub Environment if the provider condition is configured to evaluate the GitHub environment claim.
5. In GitHub repository Settings → Environments, create `production-candidate`.
   Add these repository/environment variables (not secrets; they are identifiers):
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: full provider resource name
     `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`
   - `GCP_DEPLOY_SERVICE_ACCOUNT`: deploy service account email.
6. Require an authorized reviewer for the `production-candidate` environment if available.

The workflow uses short-lived OIDC credentials. It does not require a JSON service-account key.
The existing Cloud Run service's environment variables, Secret Manager references, runtime
service account, ingress, scaling and IAM policy must be reviewed before deployment. The
workflow intentionally does not set or replace these settings.

## Repository build prerequisites

The Dockerfile uses the committed `bun.lock` with `bun install --frozen-lockfile`.
This avoids the previous Dockerfile's `npm ci` invocation without a committed
`package-lock.json`. The builder runs TypeScript checks and builds the Vite SPA plus
the bundled Express server. The runtime stage contains production dependencies only.

## Candidate deployment procedure

1. Merge the reviewed deployment PR to `main` after all checks pass.
2. Open Actions → Build and deploy Cloud Run candidate → Run workflow.
3. Select `main` and run it. The workflow checks out the exact triggering commit,
   tests auth and Firestore rules, builds an immutable image tagged with the commit SHA,
   then deploys a `github-candidate` revision with `--no-traffic`.
4. Confirm the Actions summary includes a candidate URL and that `/api/health` passes.
5. Manually test Google Sign-In and authenticated Copilot/RAG flows against the candidate.
   A successful unauthenticated health check alone is not a complete acceptance test.
6. Compare the candidate's Cloud Run revision settings with the existing revision:
   runtime service account, secret references, environment variables, ingress,
   authentication/IAM, CPU/memory, concurrency, timeout, scaling and networking.
7. Only after acceptance, use Cloud Run Manage traffic to move a small canary percentage
   to the candidate, observe errors/logs, and then promote to 100%. Keep the prior revision
   available for immediate rollback.

## Firestore rules are a separate release

The workflow tests `firestore.rules` against the Firestore emulator. It does not publish
rules to production. Before production publication, review existing profile documents and
client write patterns against the new whitelist/baseline rules. Then deploy only the rules
to the exact configured Firestore database/project using an authorized Firebase/Google
Cloud administrator. Verify the published rules and test owner/cross-user access.

## Rollback

If the candidate fails, leave traffic on the previous revision. If traffic was later shifted,
use Cloud Run Manage traffic to return 100% to the prior known-good revision. Do not delete
the prior revision or the AI Studio source bucket during this migration.

## Important limitations

- This workflow is manual-only; it does not deploy on every push to `main`.
- No Google Cloud deployment is performed by GitHub file changes alone.
- The GitHub Actions environment variables and Google Cloud WIF/IAM setup are prerequisites.
- This candidate workflow does not alter Firestore production rules or production traffic.
