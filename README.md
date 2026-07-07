# Melody Detective

Melody Detective is a tiny web app for learning to play melodies by ear.

Version 0.1 has one puzzle:

1. Choose the current practice setup from the start menu.
   - **Find One Note** asks you to match one mystery note.
   - **Pitch Movement** asks you to move up or down from a starting note.
   - **Beginner** uses white keys only.
   - **Intermediate** includes black keys.
2. Press **Start Practice**.
3. Press **Play Note**.
4. Listen to the mystery note.
5. Replay the mystery note if you need to hear it again.
6. Click the matching key on the virtual piano.
7. The app tells you **Correct**, **Too High**, or **Too Low**.
8. After a wrong guess, compare the mystery note with your guess.

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
