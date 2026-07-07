# Melody Detective

Melody Detective is a web app for learning to recognize notes, understand pitch movement, and build stronger musical instincts by ear.

## Vision

Music is one of the biggest gifts humans have received from God, and it is something that connects all ends of the earth. I have always wanted to be a part of it in a certain sense, and Melody Detective is something I believe can help generations to come hone their skills and discover a passion and ability they may not have known they possessed.

## Why I'm Building This

I do not want Melody Detective to be a simple puzzle or game. I want it to become a tool that genuinely helps musicians grow.

The goal is to create something useful for beginners who are just starting to train their ears, while also giving more advanced musicians a place to sharpen their skill. I want the app to keep people curious, creative, and connected to the process of learning music.

## Long-Term Goal

I see Melody Detective becoming the gold standard for pitch detection and ear training.

Long term, I want it to grow into a teaching platform where students and teachers can connect, practice, and learn from each other. My hope is that Melody Detective can help bridge a needed gap in how the arts are taught today, while making musical growth feel more accessible to both the young and the old.

## Current Version

Version 0.1 has one puzzle:

1. Choose the current practice setup from the start menu.
   - **Find One Note** asks you to match one mystery note.
   - **Find One Note Challenge** lets you choose a 5-streak, 10-streak, 20-streak, or 30-streak goal before practice starts.
   - **Pitch Movement** asks you to tap a named starting note, then move up or down from there.
   - **Beginner** uses white keys only.
   - **Intermediate** includes black keys and larger pitch movements.
2. Press **Start Practice**.
3. Press **Play Note**.
4. Listen to the mystery note.
5. Replay the mystery note if you need to hear it again.
6. Click the matching key on the virtual piano.
7. The app tells you when you are correct or gives a subtle direction cue.
8. After a wrong guess, compare the mystery note with your guess.
9. Build your streak and session rank by solving notes without missing.
10. When you reach your streak goal, choose whether to aim higher or continue the current challenge.

## Session Progress

Melody Detective currently tracks progress during a practice session.

- **Streak** grows only when a note is solved on the first try.
- **Challenge completion** currently applies to **Find One Note** mode only.
- **Strong recovery** still rewards finding the note after one miss, but it does not continue the streak.
- **Accuracy** compares correct solves against missed guesses.
- **Attempts** shows the total number of correct solves and missed guesses in the session.
- **Misses** shows how many incorrect guesses happened in the session.
- **Rank** starts at **Beginner** and can rise through **Listener**, **Detective**, **Virtuoso**, and **Mozart**.

Progress is not saved permanently yet. Closing or refreshing the page starts a new session.

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
