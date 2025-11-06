#!/bin/bash

# CI Monitoring Script
# Usage:
#   ./monitor-ci.sh                    # Auto-detect latest run for current branch
#   ./monitor-ci.sh <run_id>           # Monitor specific run
#   ./monitor-ci.sh --list             # List recent runs
#   ./monitor-ci.sh --latest           # Monitor latest run (any branch)
#   ./monitor-ci.sh --help             # Show help

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository info (auto-detect or configure)
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-lmcrean}"
REPO_NAME="${GITHUB_REPOSITORY_NAME:-ed-tech-app}"
REPO="${REPO_OWNER}/${REPO_NAME}"

# GitHub API base URL
API_BASE="https://api.github.com"

# Check for required tools
check_dependencies() {
  local missing_deps=()

  if ! command -v curl &> /dev/null; then
    missing_deps+=("curl")
  fi

  if ! command -v jq &> /dev/null && ! command -v python3 &> /dev/null; then
    missing_deps+=("jq or python3")
  fi

  if [ ${#missing_deps[@]} -gt 0 ]; then
    echo -e "${RED}Error: Missing required dependencies: ${missing_deps[*]}${NC}"
    echo "Please install the missing tools and try again."
    exit 1
  fi
}

# JSON parser (prefer jq, fallback to python)
parse_json() {
  local key=$1
  if command -v jq &> /dev/null; then
    jq -r "$key"
  else
    python3 -c "import sys, json; data=json.load(sys.stdin); print($key)"
  fi
}

# Get current branch
get_current_branch() {
  if [ -n "$GITHUB_HEAD_REF" ]; then
    echo "$GITHUB_HEAD_REF"
  elif [ -n "$GITHUB_REF" ]; then
    echo "${GITHUB_REF#refs/heads/}"
  else
    git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main"
  fi
}

# Show help
show_help() {
  cat <<EOF
${BLUE}CI Monitoring Script${NC}

${GREEN}Usage:${NC}
  $0                    # Auto-detect latest run for current branch
  $0 <run_id>           # Monitor specific run by ID
  $0 --list             # List recent workflow runs
  $0 --latest           # Monitor latest run (any branch)
  $0 --help             # Show this help message

${GREEN}Examples:${NC}
  $0                    # Monitor latest run on current branch
  $0 19148196827        # Monitor specific run ID
  $0 --list             # See all recent runs

${GREEN}Environment Variables:${NC}
  GITHUB_REPOSITORY_OWNER  # Repository owner (default: lmcrean)
  GITHUB_REPOSITORY_NAME   # Repository name (default: ed-tech-app)
  GITHUB_TOKEN            # GitHub token for authenticated requests

${GREEN}Features:${NC}
  - Auto-detects latest CI run for current branch
  - Real-time monitoring with status updates
  - Fetches and displays failed job logs
  - Provides actionable error diagnostics
  - Saves detailed results for analysis

EOF
  exit 0
}

# List recent workflow runs
list_runs() {
  echo -e "${BLUE}Fetching recent workflow runs for ${REPO}...${NC}\n"

  local auth_header=""
  if [ -n "$GITHUB_TOKEN" ]; then
    auth_header="Authorization: Bearer $GITHUB_TOKEN"
  fi

  local response=$(curl -s ${auth_header:+-H "$auth_header"} \
    "${API_BASE}/repos/${REPO}/actions/runs?per_page=10")

  echo -e "${GREEN}Recent Workflow Runs:${NC}\n"

  if command -v jq &> /dev/null; then
    echo "$response" | jq -r '.workflow_runs[] |
      "\(.id)\t\(.status)\t\(.conclusion // "running")\t\(.head_branch)\t\(.name)\t\(.created_at)"' | \
      while IFS=$'\t' read -r id status conclusion branch name created; do
        local status_icon="⏳"
        local status_color=$YELLOW

        if [ "$status" = "completed" ]; then
          if [ "$conclusion" = "success" ]; then
            status_icon="✅"
            status_color=$GREEN
          elif [ "$conclusion" = "failure" ]; then
            status_icon="❌"
            status_color=$RED
          elif [ "$conclusion" = "cancelled" ]; then
            status_icon="🚫"
            status_color=$YELLOW
          fi
        fi

        printf "${status_color}%s${NC} ID: %-12s Branch: %-30s %s\n" \
          "$status_icon" "$id" "$branch" "$name"
      done
  else
    echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for run in data['workflow_runs']:
    status_icon = '⏳' if run['status'] != 'completed' else ('✅' if run.get('conclusion') == 'success' else '❌')
    print(f\"{status_icon} ID: {run['id']:<12} Branch: {run['head_branch']:<30} {run['name']}\")
"
  fi

  echo -e "\n${BLUE}Use './monitor-ci.sh <run_id>' to monitor a specific run${NC}"
  exit 0
}

# Get latest run for branch
get_latest_run_for_branch() {
  local branch=$1
  local auth_header=""

  if [ -n "$GITHUB_TOKEN" ]; then
    auth_header="Authorization: Bearer $GITHUB_TOKEN"
  fi

  echo -e "${BLUE}Finding latest workflow run for branch: ${branch}${NC}" >&2

  local response=$(curl -s ${auth_header:+-H "$auth_header"} \
    "${API_BASE}/repos/${REPO}/actions/runs?branch=${branch}&per_page=1")

  local run_id=$(echo "$response" | parse_json '.workflow_runs[0].id')

  if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
    echo -e "${RED}No workflow runs found for branch: ${branch}${NC}" >&2
    echo -e "${YELLOW}Tip: Use --list to see all available runs${NC}" >&2
    exit 1
  fi

  echo "$run_id"
}

# Get latest run (any branch)
get_latest_run() {
  local auth_header=""

  if [ -n "$GITHUB_TOKEN" ]; then
    auth_header="Authorization: Bearer $GITHUB_TOKEN"
  fi

  echo -e "${BLUE}Finding latest workflow run...${NC}" >&2

  local response=$(curl -s ${auth_header:+-H "$auth_header"} \
    "${API_BASE}/repos/${REPO}/actions/runs?per_page=1")

  local run_id=$(echo "$response" | parse_json '.workflow_runs[0].id')

  if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
    echo -e "${RED}No workflow runs found${NC}" >&2
    exit 1
  fi

  echo "$run_id"
}

# Fetch and display failed job logs
fetch_failed_logs() {
  local run_id=$1
  local auth_header=""

  if [ -n "$GITHUB_TOKEN" ]; then
    auth_header="Authorization: Bearer $GITHUB_TOKEN"
  fi

  echo -e "\n${YELLOW}Fetching failed job details...${NC}"

  # Get jobs for this run
  local jobs_response=$(curl -s ${auth_header:+-H "$auth_header"} \
    "${API_BASE}/repos/${REPO}/actions/runs/${run_id}/jobs")

  # Find failed jobs
  local failed_jobs=$(echo "$jobs_response" | parse_json '.jobs[] | select(.conclusion == "failure") | .id')

  if [ -z "$failed_jobs" ]; then
    echo -e "${GREEN}No failed jobs found${NC}"
    return
  fi

  echo -e "${RED}Failed Jobs:${NC}\n"

  # Process each failed job
  while read -r job_id; do
    if [ -z "$job_id" ] || [ "$job_id" = "null" ]; then
      continue
    fi

    local job_name=$(echo "$jobs_response" | parse_json ".jobs[] | select(.id == ${job_id}) | .name")
    local job_url=$(echo "$jobs_response" | parse_json ".jobs[] | select(.id == ${job_id}) | .html_url")

    echo -e "${RED}❌ Job: ${job_name}${NC}"
    echo -e "${BLUE}   URL: ${job_url}${NC}"

    # Get job logs
    echo -e "${YELLOW}   Fetching logs...${NC}"
    local logs=$(curl -s ${auth_header:+-H "$auth_header"} \
      -H "Accept: application/vnd.github.v3+json" \
      "${API_BASE}/repos/${REPO}/actions/jobs/${job_id}/logs" 2>&1)

    # Extract error messages (last 50 lines or error patterns)
    if [ -n "$logs" ]; then
      echo -e "${YELLOW}   Last 30 lines of logs:${NC}"
      echo "$logs" | tail -n 30 | sed 's/^/   │ /'

      # Look for common error patterns
      echo -e "\n${YELLOW}   Error Analysis:${NC}"

      if echo "$logs" | grep -qi "error\|failed\|fatal"; then
        echo "$logs" | grep -i "error\|failed\|fatal" | tail -n 10 | sed 's/^/   ⚠️  /'
      fi

      if echo "$logs" | grep -qi "timeout"; then
        echo -e "   ${RED}⚠️  Timeout detected - consider increasing timeout values${NC}"
      fi

      if echo "$logs" | grep -qi "permission denied\|403"; then
        echo -e "   ${RED}⚠️  Permission issue detected - check credentials/permissions${NC}"
      fi

      if echo "$logs" | grep -qi "not found\|404"; then
        echo -e "   ${RED}⚠️  Resource not found - check URLs/paths${NC}"
      fi
    fi

    echo ""
  done <<< "$failed_jobs"

  # Save full job details
  local output_file="/tmp/failed_jobs_${run_id}.json"
  echo "$jobs_response" > "$output_file"
  echo -e "${GREEN}Full job details saved to: ${output_file}${NC}"
}

# Monitor workflow run
monitor_run() {
  local run_id=$1
  local auth_header=""

  if [ -n "$GITHUB_TOKEN" ]; then
    auth_header="Authorization: Bearer $GITHUB_TOKEN"
  fi

  echo -e "${GREEN}Starting CI monitoring for run ID: ${run_id}${NC}"
  echo -e "${BLUE}Repository: ${REPO}${NC}\n"

  local check_count=0
  local max_checks=120  # Max 2 hours with 60s intervals

  while [ $check_count -lt $max_checks ]; do
    check_count=$((check_count + 1))

    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} Check ${check_count}/${max_checks}..."

    # Fetch run status
    local response=$(curl -s ${auth_header:+-H "$auth_header"} \
      "${API_BASE}/repos/${REPO}/actions/runs/${run_id}")

    local status=$(echo "$response" | parse_json '.status')
    local conclusion=$(echo "$response" | parse_json '.conclusion')
    local workflow_name=$(echo "$response" | parse_json '.name')
    local branch=$(echo "$response" | parse_json '.head_branch')
    local html_url=$(echo "$response" | parse_json '.html_url')

    echo -e "  Workflow: ${GREEN}${workflow_name}${NC}"
    echo -e "  Branch: ${GREEN}${branch}${NC}"
    echo -e "  Status: ${YELLOW}${status}${NC}"

    if [ "$conclusion" != "null" ] && [ -n "$conclusion" ]; then
      echo -e "  Conclusion: ${YELLOW}${conclusion}${NC}"
    fi

    # Check if completed
    if [ "$status" = "completed" ]; then
      echo ""
      echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${GREEN}Workflow completed!${NC}"
      echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "  Conclusion: ${YELLOW}${conclusion}${NC}"
      echo -e "  URL: ${BLUE}${html_url}${NC}"

      # Save full results
      local output_file="/tmp/workflow_result_${run_id}.json"
      echo "$response" | python3 -m json.tool > "$output_file" 2>/dev/null || \
        echo "$response" > "$output_file"
      echo -e "  Results saved to: ${GREEN}${output_file}${NC}"

      # If failed, fetch logs
      if [ "$conclusion" = "failure" ]; then
        echo -e "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}Workflow failed - analyzing failures...${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        fetch_failed_logs "$run_id"

        echo -e "\n${YELLOW}Next steps:${NC}"
        echo -e "  1. Review the error logs above"
        echo -e "  2. Check the full logs at: ${BLUE}${html_url}${NC}"
        echo -e "  3. Fix the issues in your code"
        echo -e "  4. Push changes to trigger a new run"
        echo -e "  5. Monitor the new run with: ${GREEN}$0${NC}"

        exit 1
      elif [ "$conclusion" = "success" ]; then
        echo -e "\n${GREEN}✅ All jobs completed successfully!${NC}"
        exit 0
      elif [ "$conclusion" = "cancelled" ]; then
        echo -e "\n${YELLOW}🚫 Workflow was cancelled${NC}"
        exit 2
      else
        echo -e "\n${YELLOW}⚠️  Workflow completed with conclusion: ${conclusion}${NC}"
        exit 3
      fi
    fi

    # Wait before next check
    echo -e "  ${YELLOW}Waiting 60 seconds before next check...${NC}\n"
    sleep 60
  done

  # Timeout
  echo -e "\n${RED}Monitoring timeout reached after ${max_checks} checks${NC}"
  echo -e "${YELLOW}The workflow is still running. Check status at: ${BLUE}${html_url}${NC}"
  exit 4
}

# Main script
main() {
  check_dependencies

  # Parse arguments
  case "${1:-}" in
    --help|-h)
      show_help
      ;;
    --list|-l)
      list_runs
      ;;
    --latest)
      local run_id=$(get_latest_run)
      monitor_run "$run_id"
      ;;
    "")
      # Auto-detect run for current branch
      local branch=$(get_current_branch)
      local run_id=$(get_latest_run_for_branch "$branch")
      monitor_run "$run_id"
      ;;
    *)
      # Assume it's a run ID
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        monitor_run "$1"
      else
        echo -e "${RED}Error: Invalid argument: $1${NC}"
        echo "Use --help for usage information"
        exit 1
      fi
      ;;
  esac
}

# Run main
main "$@"
