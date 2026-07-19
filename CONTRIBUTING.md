# Contributing to WorkHours

Thanks for helping improve WorkHours. Small, focused contributions are welcome.

## Before you start

1. Search existing issues to avoid duplicates.
2. Open an issue for bugs or meaningful feature changes.
3. Keep user data local unless a change explicitly documents a different privacy model.

## Local development

```bash
git clone https://github.com/eternalstoneinside/WorkHours.git
cd WorkHours
python -m http.server 8000
```

Open `http://localhost:8000` and verify the application in a modern browser.

## Pull requests

- Create a focused branch from `main`.
- Keep the change limited to one concern.
- Use clear commit and pull-request descriptions.
- Test calendar navigation, shift editing, reports, backups, and offline startup when relevant.
- Include screenshots for visible interface changes.
- Never commit personal work records, exported backups, credentials, or generated secrets.

## Bug reports

Use the bug-report form and include:

- the browser and operating system;
- steps to reproduce the problem;
- the expected and actual behavior;
- whether the app was installed as a PWA;
- screenshots or console messages when useful.
