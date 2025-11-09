# Deployment Security Configuration Guide

This guide explains how to configure multi-layer security for preview deployments that provides both convenience for maintainers and security against external bad actors.

## Security Architecture

### Layer 1: Workflow Code Authorization Check ✅ (Already Implemented)
- File: `.github/workflows/deploy-branch-preview.yml`
- Uses `pull_request_target` to run workflow from base repo (prevents tampering)
- Checks if PR author is a collaborator
- Requires `deploy-preview` label for external contributors

### Layer 2: GitHub Environment Protection Rules ⚠️ (NEEDS CONFIGURATION)
This is the critical missing piece - it CANNOT be configured in code, only through GitHub UI.

### Layer 3: Branch Protection Rules ⚠️ (NEEDS CONFIGURATION)
Protects the workflow file itself from unauthorized changes.

---

## Required GitHub Settings Configuration

### 1. Configure Environment Protection Rules

**Location:** GitHub.com → Repository Settings → Environments → `preview-deployments`

**Configure:**

1. **Required Reviewers:**
   - Add: `lmcrean` (repository owner)
   - This creates a mandatory approval gate that CANNOT be bypassed by code

2. **Deployment Branches:**
   - Select "Selected branches"
   - Add rule: `**` (all branches allowed after approval)
   - This allows any branch to deploy, but only after approval for non-collaborators

3. **Prevent self-review:**
   - ✅ Enable "Prevent approvals from users who pushed recent commits"
   - This prevents the PR author from approving their own deployment

**Effect:**
- lmcrean (owner): Can approve deployments for external PRs
- Collaborators: Auto-approved (no wait time) because they're trusted
- External contributors: **MUST wait** for lmcrean to approve the deployment in GitHub UI

---

### 2. Configure Branch Protection Rules for `main`

**Location:** GitHub.com → Repository Settings → Branches → Add rule for `main`

**Configure:**

1. **Require pull request reviews before merging:**
   - ✅ Required approving reviews: 1
   - ✅ Dismiss stale reviews when new commits are pushed

2. **Require status checks to pass:**
   - ✅ Require branches to be up to date
   - Add required checks: (your CI checks)

3. **Restrict who can push to matching branches:**
   - Add: `lmcrean` and any trusted collaborators
   - This prevents anyone from pushing directly to main

4. **Include administrators:** ⚠️
   - ❌ Do NOT enable if you want convenience for lmcrean
   - ✅ Enable if you want maximum security (even owner needs PR review)

**Effect:**
- Protects workflow files in `.github/workflows/` from tampering
- Even if someone modifies `deploy-branch-preview.yml` in their PR, the change won't be in the base branch's version that runs

---

### 3. Configure CODEOWNERS Protection (Optional Extra Layer)

**File:** `.github/CODEOWNERS` (already exists in repo based on grep results)

**Ensure it includes:**
```
# Workflow files require owner approval
/.github/workflows/* @lmcrean

# Security-sensitive configuration
/.github/project-config.yml @lmcrean
```

**Then in Branch Protection Rules for `main`:**
- ✅ Enable "Require review from Code Owners"

**Effect:**
- Any changes to workflow files require explicit approval from `@lmcrean`
- Adds another layer of protection against workflow tampering

---

## How This Achieves Your Goals

### ✅ Convenience for lmcrean:
1. You're a repository admin/owner
2. Collaborator check in workflow passes automatically (line 67-77 in workflow)
3. Environment approval: You can approve your own deployments instantly
4. **Result:** No waiting, no friction

### ✅ Security for External Contributors:
1. Workflow runs from base repo (can't be tampered with)
2. Authorization check fails (not a collaborator)
3. Requires `deploy-preview` label (line 88-96)
4. **Environment protection:** Even if label is added, deployment waits for your approval
5. Branch protection: Can't merge malicious workflow changes without review
6. **Result:** Multiple layers of approval required

---

## Current Gap: Why Test Account is Deploying

**Diagnosis Steps:**

1. Check if `lmcrean-testaccount` has collaborator access:
   ```bash
   # Using GitHub API or in GitHub UI:
   Settings → Collaborators and teams
   ```

2. Check if environment `preview-deployments` has protection rules:
   ```bash
   Settings → Environments → preview-deployments
   ```

3. Verify the authorization check output in the workflow run logs

**Most Likely Cause:**
- The `preview-deployments` environment exists but has NO required reviewers configured
- This means the workflow proceeds automatically after `check-authorization` passes

**Fix:**
Add required reviewers to the environment (see Step 1 above)

---

## Testing the Security

### Test 1: External Contributor Without Label
1. Create PR from external account (without `deploy-preview` label)
2. **Expected:**
   - `check-authorization` job completes successfully
   - Sets `authorized: false`
   - `deploy` job is skipped (line 129 condition)
   - Bot comment posted asking for label

### Test 2: External Contributor With Label (No Environment Protection)
1. Add `deploy-preview` label
2. **Expected:**
   - `check-authorization` passes: `authorized: true`
   - `deploy` job starts
   - **⚠️ CURRENTLY:** Deploys immediately (SECURITY GAP)
   - **SHOULD BE:** Waits for environment approval

### Test 3: External Contributor With Label (With Environment Protection)
1. Add `deploy-preview` label
2. **Expected:**
   - `check-authorization` passes
   - `deploy` job starts but pauses
   - GitHub shows "Waiting for approval" in Environments tab
   - lmcrean must approve in GitHub UI
   - Only then does deployment proceed

### Test 4: lmcrean (Owner) PR
1. Create PR from lmcrean account
2. **Expected:**
   - `check-authorization` passes immediately (collaborator)
   - `deploy` job starts
   - Environment approval bypassed (owner/admin privilege)
   - Deployment proceeds automatically

---

## Implementation Checklist

- [ ] Configure `preview-deployments` environment with required reviewers
- [ ] Set up branch protection rules for `main` branch
- [ ] Verify CODEOWNERS file includes workflow paths
- [ ] Remove `lmcrean-testaccount` from collaborators (if present)
- [ ] Test with external contributor PR (without label) - should not deploy
- [ ] Test with external contributor PR (with label) - should wait for approval
- [ ] Test with lmcrean account PR - should deploy automatically
- [ ] Document the process for approving external deployments

---

## Additional Recommendations

### 1. Add Deployment Approval Documentation
Create a note in `CONTRIBUTING.md` explaining:
- External contributors need the `deploy-preview` label
- Deployments require maintainer approval
- How long to expect for approval (SLA)

### 2. Consider Separate Environments
For more granular control:
- `preview-deployments-trusted` (no approval needed) - for collaborators
- `preview-deployments-external` (approval required) - for external contributors
- Update workflow to use different environment based on collaborator status

### 3. Monitor Authorization Bypasses
- Set up alerts for when deployments happen without proper authorization
- Use the `monitor-ci.yml` workflow to track this

### 4. Audit Collaborator List Regularly
- Review Settings → Collaborators quarterly
- Remove test accounts and inactive collaborators
- Document why each collaborator needs access

---

## Why This Can't Be Purely Code-Based

You're correct that this can't be hardcoded because:

1. **Code can be modified in PRs:** If authorization was only in code, a bad actor could modify the workflow file in their PR to bypass checks

2. **`pull_request_target` solves this:** Runs the workflow from the BASE repository, not the PR branch
   - ✅ Malicious PR can't modify the running workflow
   - ✅ Workflow code is protected

3. **But secrets are still accessible:** `pull_request_target` has access to secrets (needed for deployment)
   - ⚠️ If authorization check is bypassed somehow, secrets are exposed

4. **Environment Protection is the platform-level gate:**
   - ❌ Cannot be bypassed by code
   - ❌ Cannot be modified in PRs
   - ✅ Requires human approval in GitHub UI
   - ✅ Enforced by GitHub platform, not your code

**The Security Model:**
```
PR Created (External User)
    ↓
Workflow runs from BASE repo (can't be tampered) ← pull_request_target
    ↓
Authorization check in code (first gate) ← Your workflow logic
    ↓
GitHub Environment protection (second gate) ← Platform-level setting
    ↓
Human approval required (third gate) ← lmcrean clicks "Approve" in UI
    ↓
Deployment proceeds with secrets
```

Without the environment protection layer, you only have the first gate, which could have bugs or edge cases.

---

## Quick Fix Right Now

**Immediate action to secure your repository:**

1. Go to: https://github.com/lmcrean/ed-tech-app/settings/environments
2. Click on `preview-deployments` (or create it if it doesn't exist)
3. Check "Required reviewers"
4. Add yourself: `lmcrean`
5. Save protection rules

**This single change will:**
- Force all external PRs to wait for your approval
- Still allow you to deploy instantly (as repo owner)
- Cannot be bypassed by any code changes

Then test with the `lmcrean-testaccount` PR #24 - it should now be waiting for your approval.
