# Next Steps Before Submission

This file is the handoff checklist for the remaining external steps.

## Current Local Status

Done locally:

- Web demo is implemented.
- README is complete enough for another developer to run the project.
- Trading Infra submission draft is in `SUBMISSION.md`.
- Verifiable usage record is in `examples/demo-run-log.md`.
- Sample input/output files are in `examples/`.
- Demo video script is in `DEMO_VIDEO_SCRIPT.md`.
- Local tests pass with `npm test`.
- Local Git commits exist on branch `main`.

Done externally:

- Public GitHub repository: `https://github.com/ELLE0928/ai-trading-dmv`

Not done yet:

- Public demo/video URL.
- Final hackathon form submission.

## 1. GitHub CLI Login

Done. Current logged-in account:

```text
ELLE0928
```

Success sign:

```bash
gh auth status
```

shows that you are logged in.

## 2. Public GitHub Repository

Done:

```text
https://github.com/ELLE0928/ai-trading-dmv
```

Success sign:

- GitHub prints a repository URL.
- The repo page is public.
- README is visible on the repo page.

## 3. Update Submission Links

The GitHub repository URL has been filled into:

```text
SUBMISSION.md
```

Remaining success sign:

- If a public demo video is recorded, add that URL to `SUBMISSION.md`.

## 4. Optional Demo Video

Use:

```text
DEMO_VIDEO_SCRIPT.md
```

Target length:

```text
90-120 seconds
```

Success sign:

- The video shows one failed agent and one passed agent.
- The video is public on Twitter/X or YouTube.
- The video link can be opened without login.

## 5. Hackathon Form

Recommended track:

```text
Trading Infra
```

Project description:

Copy the Chinese section from:

```text
SUBMISSION.md
```

Submission material links:

- GitHub repository URL
- `examples/demo-run-log.md` GitHub URL
- optional video URL

Success sign:

- The form accepts the links.
- All required fields are filled.

## If Something Breaks

Most likely blockers:

- GitHub CLI is not logged in.
- Repository name `ai-trading-dmv` is already taken.
- GitHub push asks for authentication again.
- Video upload is not public.

If the repo name is taken, use:

```bash
gh repo create ai-trading-dmv-hackathon --public --source=. --remote=origin --push
```
