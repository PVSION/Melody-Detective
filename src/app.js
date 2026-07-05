const notes = [
  { name: "C4", frequency: 261.63, keyType: "white" },
  { name: "C#4", frequency: 277.18, keyType: "black", position: 12.5 },
  { name: "D4", frequency: 293.66, keyType: "white" },
  { name: "D#4", frequency: 311.13, keyType: "black", position: 25 },
  { name: "E4", frequency: 329.63, keyType: "white" },
  { name: "F4", frequency: 349.23, keyType: "white" },
  { name: "F#4", frequency: 369.99, keyType: "black", position: 50 },
  { name: "G4", frequency: 392.0, keyType: "white" },
  { name: "G#4", frequency: 415.3, keyType: "black", position: 62.5 },
  { name: "A4", frequency: 440.0, keyType: "white" },
  { name: "A#4", frequency: 466.16, keyType: "black", position: 75 },
  { name: "B4", frequency: 493.88, keyType: "white" },
  { name: "C5", frequency: 523.25, keyType: "white" }
];

const playButton = document.querySelector("#play-note");
const feedback = document.querySelector("#feedback");
const keyboard = document.querySelector("#keyboard");
const menuScreen = document.querySelector("#menu-screen");
const practiceScreen = document.querySelector("#practice-screen");
const startPracticeButton = document.querySelector("#start-practice");
const backToMenuButton = document.querySelector("#back-to-menu");
const practiceSummary = document.querySelector("#practice-summary");
const settingOptions = document.querySelectorAll(".setting-option");

const settings = {
  instrument: "piano",
  mode: "single-note",
  difficulty: "beginner"
};

const settingLabels = {
  instrument: {
    piano: "Piano"
  },
  mode: {
    "single-note": "Find One Note"
  },
  difficulty: {
    beginner: "Beginner"
  }
};

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

function updatePracticeSummary() {
  const instrument = settingLabels.instrument[settings.instrument];
  const mode = settingLabels.mode[settings.mode];
  const difficulty = settingLabels.difficulty[settings.difficulty];

  practiceSummary.textContent = `${instrument} - ${mode} - ${difficulty}`;
}

function resetPracticeRound() {
  mysteryNoteIndex = chooseRandomNoteIndex();
  hasPlayedMysteryNote = false;
  showFeedback("Ready when you are.", "");
}

function showMenu() {
  practiceScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
  resetPracticeRound();
}

function startPractice() {
  updatePracticeSummary();
  resetPracticeRound();
  menuScreen.classList.add("hidden");
  practiceScreen.classList.remove("hidden");
}

function handleSettingChoice(option) {
  const setting = option.dataset.setting;
  const value = option.dataset.value;

  settings[setting] = value;

  document.querySelectorAll(`[data-setting="${setting}"]`).forEach((settingOption) => {
    const isSelected = settingOption === option;

    settingOption.classList.toggle("selected", isSelected);
    settingOption.setAttribute("aria-pressed", String(isSelected));
  });
}

function handleGuess(guessedNoteIndex) {
  if (!hasPlayedMysteryNote) {
    showFeedback("Press Play Note first.", "");
    return;
  }

  playFrequency(notes[guessedNoteIndex].frequency);

  if (guessedNoteIndex === mysteryNoteIndex) {
    showFeedback(`Correct - ${notes[mysteryNoteIndex].name}`, "correct");
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
    if (note.keyType !== "white") {
      return;
    }

    const key = document.createElement("button");

    key.className = "key white-key";
    key.type = "button";
    key.setAttribute("aria-label", `Guess ${note.name}`);
    key.addEventListener("click", () => handleGuess(index));

    keyboard.appendChild(key);
  });

  notes.forEach((note, index) => {
    if (note.keyType !== "black") {
      return;
    }

    const key = document.createElement("button");

    key.className = "key black-key";
    key.type = "button";
    key.style.setProperty("--key-left", `${note.position}%`);
    key.setAttribute("aria-label", `Guess ${note.name}`);
    key.addEventListener("click", () => handleGuess(index));

    keyboard.appendChild(key);
  });
}

playButton.addEventListener("click", () => {
  playFrequency(notes[mysteryNoteIndex].frequency);
  hasPlayedMysteryNote = true;
  showFeedback("Find that note on the keyboard.", "");
});

startPracticeButton.addEventListener("click", startPractice);
backToMenuButton.addEventListener("click", showMenu);

settingOptions.forEach((option) => {
  option.addEventListener("click", () => handleSettingChoice(option));
});

createKeyboard();
updatePracticeSummary();
