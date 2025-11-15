# Branch Protection Setup

To enforce the workflow where all changes go through PRs and main is protected, configure these settings in GitHub:

## Required Settings

Go to: `https://github.com/YOUR_USERNAME/ProgressLogger/settings/branches`

### Protect the `main` branch:

1. Click "Add branch protection rule"
2. Branch name pattern: `main`
3. Enable these settings:

   **Protect matching branches:**
   - ✅ Require a pull request before merging
     - ✅ Require approvals: 0 (or 1 if you want self-review)
     - ✅ Dismiss stale pull request approvals when new commits are pushed (optional)

   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - Add required status checks:
       - `test` (from the CI workflow)

   - ✅ Require conversation resolution before merging (optional but recommended)

   - ✅ Do not allow bypassing the above settings
     - ⚠️ Uncheck "Allow specified actors to bypass" unless you want admin override

4. Click "Create" or "Save changes"

## What this enforces:

- ❌ No direct pushes to main
- ✅ All changes must go through PRs
- ✅ All tests must pass before merging
- ✅ Version must be bumped in every PR (enforced by CI)
- ✅ On merge to main → automatic npm publish

## Workflow Summary:

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Bump version: `npm version patch` (or minor/major)
4. Push and create PR: `git push -u origin feature/my-feature`
5. CI runs automatically and checks:
   - Tests pass
   - Lint passes
   - Build succeeds
   - Version was bumped
6. Merge PR to main
7. GitHub Actions automatically publishes to npm
