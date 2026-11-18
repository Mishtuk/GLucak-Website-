Source: OneRedOak/claude-code-workflows/guides/orchestration-layer/templates/review-triage.md @ 29a34c725313c7621f426f838ed31cf482473fb4, MIT, stripped per docs/research/repo-safety-log.md (frontmatter, tool lists, run/push/self-edit lines removed). Our overrides in SKILL.md win.

# Review triage rules

Adapted from the condensed review-and-push excerpt on page 9 of *The Orchestration Layer Playbook*. This is a decision aid, not the complete executable skill. It does not grant permission to push changes or post replies.

## Confidence

- **Human reviewer:** start high. Downgrade only after reading the code and confirming the comment misinterprets it.
- **gstack review:** start medium-high. Upgrade to high when an independent Codex review agrees.
- **Codex challenge:** start medium. A concrete reproduction supports high confidence.
- **CodeRabbit:** start low. Read the code and form an independent judgment; do not upgrade solely because a bot asserted a problem.

## Decisions

| Decision | When to use it |
| --- | --- |
| Act | High confidence, or medium confidence for correctness, security, tests, error handling, or data integrity |
| Skip with a substantive reply | The finding is incorrect or outside the agreed scope |
| Skip without a reply | A style or naming preference where the code is correct |

Record every decision in a triage manifest, including skips. Disagreement is allowed; an unexplained omission is not.

## Working rules

- Read the surrounding code before judging a comment.
- Write the manifest before applying fixes.
- Keep fixes, pushes, and replies within the user's authorized scope.

## Manifest starting point

| Finding/source | Evidence | Confidence | Decision | Rationale | Fix/check |
| --- | --- | --- | --- | --- | --- |
| {comment or finding link} | {code location or reproduction} | {high/medium/low} | {act/skip with reply/skip without reply} | {why} | {commit and validation, if applicable} |


