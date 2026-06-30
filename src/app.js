const notes = [
  { name: "C4", frequency: 261.63 },
  { name: "D4", frequency: 293.66 },
  { name: "E4", frequency: 329.63 },
  { name: "F4", frequency: 349.23 },
  { name: "G4", frequency: 392.0 },
  { name: "A4", frequency: 440.0 },
  { name: "B4", frequency: 493.88 },
  { name: "C5", frequency: 523.25 }
];

const playButton = document.querySelector("#play-note");
const feedback = document.querySelector("#feedback");
const keyboard = document.querySelector("#keyboard");
const blackKeyPositions = [12.5, 25, 50, 62.5, 75];

let audioContext;
let mysteryNoteIndex = chooseRandomNoteIndex();
let hasPlayedMysteryNote = false;

function chooseRandomNoteIndex() {
  return Math.floor(Math.random() * notes.length);
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

function playFrequency(frequency) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  volume.gain.setValueAtTime(0.0001, context.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.35, context.currentTime + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.9);

  oscillator.connect(volume);
  volume.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.95);
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
}

function handleGuess(guessedNoteIndex) {
  if (!hasPlayedMysteryNote) {
    showFeedback("Press Play Note first.", "");
    return;
  }

  playFrequency(notes[guessedNoteIndex].frequency);

  if (guessedNoteIndex === mysteryNoteIndex) {
    showFeedback("Correct", "correct");
    mysteryNoteIndex = chooseRandomNoteIndex();
    hasPlayedMysteryNote = false;
    return;
  }

  if (guessedNoteIndex > mysteryNoteIndex) {
    showFeedback("Too High", "hint");
  } else {
    showFeedback("Too Low", "hint");
  }
}

function createKeyboard() {
  notes.forEach((note, index) => {
    const key = document.createElement("button");

    key.className = "key white-key";
    key.type = "button";
    key.textContent = note.name;
    key.setAttribute("aria-label", `Guess ${note.name}`);
    key.addEventListener("click", () => handleGuess(index));

    keyboard.appendChild(key);
  });

  blackKeyPositions.forEach((position) => {
    const key = document.createElement("span");

    key.className = "black-key";
    key.style.setProperty("--key-left", `${position}%`);
    key.setAttribute("aria-hidden", "true");

    keyboard.appendChild(key);
  });
}

playButton.addEventListener("click", () => {
  playFrequency(notes[mysteryNoteIndex].frequency);
  hasPlayedMysteryNote = true;
  showFeedback("Find that note on the keyboard.", "");
});

createKeyboard();
