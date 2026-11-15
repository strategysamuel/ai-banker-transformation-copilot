# Open-source Maintainer Guide

## Project identity

- **Project:** AI Banker Transformation Copilot
- **Repository:** https://github.com/strategysamuel/ai-banker-transformation-copilot
- **Maintainer:** `@strategysamuel`
- **License:** Apache License 2.0
- **Primary stack:** TypeScript, React, Node.js/Express, Google Gemini, Firebase/Firestore, Google Cloud Run

## What the project does

The project is an experimental, demonstration-oriented AI workspace for banking professionals. Its Project Compass component demonstrates retrieval-augmented policy assistance with active-version filtering, citation validation, refusal handling for insufficient evidence, and human-verification signals for high-risk scenarios.

The repository contains synthetic SOP examples only. These examples are not official bank policies and must not be represented as authoritative legal, regulatory, compliance, or operational instructions.

## How to contribute

Read [CONTRIBUTING.md](../CONTRIBUTING.md), [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md), and [SECURITY.md](../SECURITY.md) before contributing. Start with a focused issue, use a feature branch, and submit a pull request with reproducible test evidence.

Good first contributions include documentation corrections, accessibility improvements, deterministic tests, dependency updates, and isolated bug fixes.

## Maintainer release checklist

- Review the diff and dependency changes.
- Run type-checking, relevant tests, and production build.
- Confirm no credentials, personal data, or confidential banking data are present.
- Confirm synthetic-data disclaimers remain visible.
- Confirm unsupported-policy requests fail closed.
- Review the GitHub Actions results.
- Describe known limitations and migration notes in release notes.

## Adoption and programme-application evidence

If applying to an open-source support programme, report only verifiable, dated evidence. Useful sources include:

- GitHub repository Insights (traffic, clones, visitors, contributors).
- GitHub API contributor and pull-request history.
- Dependents/dependent packages from supported package registries.
- Registry download statistics, if this repository is later published as a package.
- OpenSSF criticality score, if one is available.
- External projects, maintainers, or users who can confirm actual reliance.

Do not count the maintainer's own commits as external contributors. Do not treat stars, page views, generated commits, or the project's own deployment as dependent repositories or package downloads. Do not manufacture contributors, issues, pull requests, downloads, releases, or adoption claims.

## Current evidence limitations

The application is a public source repository, but it is not currently established as a widely depended-on library or package. The repository's public metadata should be checked at application time for current stars, forks, contributors, releases, and dependency signals. The project should be presented honestly as an application/demo with an emerging open-source contribution path, not as critical ecosystem infrastructure without evidence.
