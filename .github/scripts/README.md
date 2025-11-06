# CI Monitoring Tools

Comprehensive tools for monitoring GitHub Actions CI/CD workflows, designed for use with both Claude Code and manual operations.

## Quick Start

### Basic Usage (Auto-detect latest run)

```bash
# Monitor the latest CI run for your current branch
./.github/scripts/monitor-ci.sh
```

### Monitor Specific Run

```bash
# Monitor a specific workflow run by ID
./.github/scripts/monitor-ci.sh 19148196827
```

### List Recent Runs

```bash
# See all recent workflow runs
./.github/scripts/monitor-ci.sh --list
```

## Features

✨ **Auto-Detection**: Automatically finds the latest CI run for your current branch
🔍 **Real-time Monitoring**: Polls GitHub API every 60 seconds for status updates
🚨 **Failure Analysis**: Fetches and displays logs from failed jobs
📊 **Comprehensive Reporting**: Saves detailed JSON results for analysis
🎯 **Smart Diagnostics**: Identifies common error patterns (timeouts, permissions, 404s)
🌐 **Multi-Branch Support**: Monitor runs across different branches
💡 **Actionable Insights**: Provides next steps when failures occur

## Usage Modes

### 1. Auto-detect (Default)

Monitors the latest run for your current Git branch:

```bash
./.github/scripts/monitor-ci.sh
```

**Use case**: You just pushed changes and want to monitor the CI run for your branch.

### 2. Specific Run ID

Monitor a specific workflow run:

```bash
./.github/scripts/monitor-ci.sh 19148196827
```

**Use case**: You want to monitor a specific run (found via --list or GitHub UI).

### 3. Latest Run (Any Branch)

Monitor the most recent workflow run across all branches:

```bash
./.github/scripts/monitor-ci.sh --latest
```

**Use case**: Quick check on the latest activity in the repository.

### 4. List Mode

Display recent workflow runs with their status:

```bash
./.github/scripts/monitor-ci.sh --list
```

**Output example**:
```
✅ ID: 19148196827  Branch: main                         CI/CD Pipeline
⏳ ID: 19148196825  Branch: feature/new-auth            Deploy Branch Preview
❌ ID: 19148196823  Branch: fix/database-bug            Reusable Test Workflow
```

## GitHub Actions Integration

### Manual Trigger

Trigger monitoring via GitHub UI:

1. Go to **Actions** → **Monitor CI Run**
2. Click **Run workflow**
3. Configure options:
   - **Mode**: `auto`, `latest`, `specific`, or `list`
   - **Run ID**: (optional) Specific run ID to monitor
   - **Branch**: (optional) Branch to monitor

### Workflow Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `run_id` | Workflow Run ID to monitor | No | auto-detect |
| `mode` | Monitor mode (`auto`, `latest`, `specific`, `list`) | Yes | `auto` |
| `branch` | Branch to monitor (for auto mode) | No | current |

### Example: Monitor Specific Run

```yaml
# Manually trigger with specific run ID
Mode: specific
Run ID: 19148196827
```

### Example: Auto-detect for Branch

```yaml
# Monitor latest run on a specific branch
Mode: auto
Branch: feature/new-feature
```

## Output and Results

### Console Output

The script provides real-time colored output:

- 🔵 **Blue**: Informational messages
- 🟡 **Yellow**: Status updates and warnings
- 🟢 **Green**: Success messages
- 🔴 **Red**: Errors and failures

### Saved Files

When monitoring completes:

1. **Workflow Results**: `/tmp/workflow_result_<run_id>.json`
   - Complete workflow run details
   - Status, conclusion, timing
   - Run metadata

2. **Failed Job Logs**: `/tmp/failed_jobs_<run_id>.json` (if failures)
   - Detailed job information
   - Error logs and diagnostics
   - Failure patterns

### Sample Output

```
[2025-11-06 15:30:45] Check 1/120...
  Workflow: CI/CD Pipeline
  Branch: main
  Status: in_progress
  Waiting 60 seconds before next check...

[2025-11-06 15:31:45] Check 2/120...
  Workflow: CI/CD Pipeline
  Branch: main
  Status: completed
  Conclusion: failure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Workflow failed - analyzing failures...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Job: test-api
   URL: https://github.com/lmcrean/ed-tech-app/actions/runs/19148196827
   Fetching logs...
   Last 30 lines of logs:
   │ Error: Process completed with exit code 1
   │ npm ERR! Test failed
   ...

   Error Analysis:
   ⚠️  Permission issue detected - check credentials/permissions
```

## Environment Variables

### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub token for authenticated requests | (none) |
| `GITHUB_REPOSITORY_OWNER` | Repository owner | `lmcrean` |
| `GITHUB_REPOSITORY_NAME` | Repository name | `ed-tech-app` |

### Using GitHub Token

For higher rate limits and private repositories:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
./.github/scripts/monitor-ci.sh
```

**Note**: GitHub Actions automatically provides `GITHUB_TOKEN` in workflows.

## Prerequisites

### Required Tools

- **curl**: For API requests
- **git**: For branch detection
- **jq** or **python3**: For JSON parsing (at least one required)

### Installation

**macOS**:
```bash
brew install curl jq git
```

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install curl jq git
```

**Already available in GitHub Actions runners** ✅

## Use Cases with Claude

### Claude Code

```bash
# Claude Code can run this directly
./github/scripts/monitor-ci.sh

# Or with specific run ID
./.github/scripts/monitor-ci.sh 19148196827
```

### Claude for Web

Provide Claude with the script content and ask it to:

1. **Analyze monitoring results**:
   ```
   Here's the output from the CI monitor:
   [paste output]
   Can you help me understand what failed?
   ```

2. **Get monitoring commands**:
   ```
   Show me how to monitor my latest CI run
   ```

3. **Diagnose failures**:
   ```
   The monitoring script found these errors:
   [paste error logs]
   How should I fix this?
   ```

## Advanced Examples

### Monitor and Fix Loop

```bash
# Monitor the latest run
./.github/scripts/monitor-ci.sh

# If it fails, the script will show you:
# 1. Error logs
# 2. Diagnostic analysis
# 3. Next steps

# Fix the issues, commit, and push
git add .
git commit -m "Fix CI errors"
git push

# Monitor the new run
./.github/scripts/monitor-ci.sh
```

### Custom Repository

```bash
# Monitor a different repository
export GITHUB_REPOSITORY_OWNER="myorg"
export GITHUB_REPOSITORY_NAME="myrepo"
./.github/scripts/monitor-ci.sh --list
```

### Automated Monitoring in CI

```yaml
# In a GitHub Actions workflow
- name: Monitor Deployment
  run: |
    # Get the run ID of the deployment workflow
    RUN_ID=$(gh run list --workflow=deploy.yml --limit=1 --json databaseId -q '.[0].databaseId')

    # Monitor it
    ./.github/scripts/monitor-ci.sh $RUN_ID
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### "No workflow runs found for branch"

**Solution**:
- Verify the branch name is correct: `git branch`
- Check if there are any runs: `./.github/scripts/monitor-ci.sh --list`
- Use a specific run ID instead

### "Rate limit exceeded"

**Solution**:
- Add a GitHub token: `export GITHUB_TOKEN="your_token"`
- Wait for rate limit reset (shown in error message)

### "Missing required dependencies"

**Solution**:
- Install required tools (see Prerequisites)
- Ensure PATH includes tool locations

### "Permission denied"

**Solution**:
- Make script executable: `chmod +x ./.github/scripts/monitor-ci.sh`
- Check file permissions: `ls -l ./.github/scripts/monitor-ci.sh`

## Integration Tips

### With Pull Requests

```bash
# Create PR, then monitor the CI run
gh pr create --title "New feature" --body "Description"
./.github/scripts/monitor-ci.sh
```

### With Automated Deployments

```bash
# Push changes
git push origin main

# Monitor the deployment CI run
./.github/scripts/monitor-ci.sh --latest
```

### In Pre-commit Hooks

```bash
# .git/hooks/pre-push
#!/bin/bash

echo "Checking if previous CI run passed..."
if ! ./.github/scripts/monitor-ci.sh --latest; then
  echo "Warning: Latest CI run failed. Continue anyway? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

## API Rate Limits

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour
- **Monitoring interval**: 60 seconds (1 request/minute)

**Recommendation**: Use `GITHUB_TOKEN` for monitoring sessions longer than 1 hour.

## Contributing

To improve the monitoring script:

1. Test your changes locally
2. Update this documentation
3. Submit a pull request

## Support

For issues or questions:

1. Check this README
2. Review script output and error messages
3. Check GitHub Actions logs
4. Open an issue with:
   - Command used
   - Full output
   - Expected behavior

## License

Part of the ed-tech-app repository.
