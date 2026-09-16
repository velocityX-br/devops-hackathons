
Mark a PR to draft state 

```
gh pr view 3 --repo example.com --json
⏺ PR #numbe ,title,isDraft,state,id 2>&1)raphQL 的 convertPullRequestToDraft mutation 转换

gh api graphql -f query='mutation { convertPullRequestToDraft(input: {pullRequestId:
      "MDExOlB1bGxSZXF1ZXN0MTE1MjU0NjM="}) { pullRequest { number isDraft } } }' --hostname example.com 2>&1
```