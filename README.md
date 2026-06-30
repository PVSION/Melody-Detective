# Melody Detective

Melody Detective is a tiny web app for learning to play melodies by ear.

Version 0.1 has one puzzle:

1. Press **Play Note**.
2. Listen to the mystery note.
3. Click the matching key on the virtual piano.
4. The app tells you **Correct**, **Too High**, or **Too Low**.

## How to Run

No setup is required.

Open this file in your browser:

```text
index.html
```

You can double-click the file, or right-click it and choose your browser.

## Deployment

For GitHub Pages, publish from the repository root.

GitHub Pages looks for an `index.html` file at the published location. This project has one at the root so the shared site URL can load the app directly.

## Project Structure

```text
melody detective/
  README.md
  docs/
    v0.1-plan.md
  src/
    index.html
    styles.css
    app.js
  assets/
```

## Technology

This version uses only:

- HTML
- CSS
- JavaScript
- The browser Web Audio API

There is no React, no database, no accounts, and no build tools.
