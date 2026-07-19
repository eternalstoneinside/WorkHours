# WorkHours

A mobile-first shift and overtime tracker that works offline and keeps data on the user's device.

[Live demo](https://eternalstoneinside.github.io/WorkHours/)

## Overview

WorkHours provides a calendar-based workflow for recording shifts, overtime, and days off. It calculates monthly and annual totals, produces shareable reports, and supports portable JSON backups without requiring an account or backend.

## Highlights

- Calendar-based shift entry
- First-shift, second-shift, day-off, and overtime tracking
- Monthly and annual work summaries
- Downloadable and shareable text reports
- JSON backup, restore, and merge workflows
- LocalStorage persistence
- Installable PWA with offline service worker

## Tech stack

HTML5 · CSS3 · JavaScript · LocalStorage · Service Worker · Web Share API

## Run locally

```bash
git clone https://github.com/eternalstoneinside/WorkHours.git
cd WorkHours
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Project structure

```text
index.html       Application interface
style.css        Mobile-first styling
app.js           Calendar, reports, and persistence
sw.js            Offline service worker
manifest.json    PWA metadata
icon.*           Application icons
```

## Privacy

Work records remain in the browser's local storage unless the user explicitly exports or shares them.

## Author

Designed and developed by [Dmytro Orlenko](https://github.com/eternalstoneinside).
