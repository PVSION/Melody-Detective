const notes = [
  { name: "C4", label: "C", frequency: 261.63, keyType: "white" },
  { name: "C#4", label: "C#", frequency: 277.18, keyType: "black", position: 12.5 },
  { name: "D4", label: "D", frequency: 293.66, keyType: "white" },
  { name: "D#4", label: "D#", frequency: 311.13, keyType: "black", position: 25 },
  { name: "E4", label: "E", frequency: 329.63, keyType: "white" },
  { name: "F4", label: "F", frequency: 349.23, keyType: "white" },
  { name: "F#4", label: "F#", frequency: 369.99, keyType: "black", position: 50 },
  { name: "G4", label: "G", frequency: 392.0, keyType: "white" },
  { name: "G#4", label: "G#", frequency: 415.3, keyType: "black", position: 62.5 },
  { name: "A4", label: "A", frequency: 440.0, keyType: "white" },
  { name: "A#4", label: "A#", frequency: 466.16, keyType: "black", position: 75 },
  { name: "B4", label: "B", frequency: 493.88, keyType: "white" },
  { name: "C5", label: "C", frequency: 523.25, keyType: "white" }
];

const playButton = document.querySelector("#play-note");
const instructions = document.querySelector("#instructions");
const movementCommand = document.querySelector("#movement-command");
const feedback = document.querySelector("#feedback");
const successMoment = document.querySelector("#success-moment");
const successTitle = document.querySelector(".success-title");
const successNote = document.querySelector(".success-note");
const keyboard = document.querySelector("#keyboard");
const listeningTools = document.querySelector("#listening-tools");
const compareTools = document.querySelector("#compare-tools");
const replayNoteButton = document.querySelector("#replay-note");
const playYourGuessButton = document.querySelector("#play-your-guess");
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
    "single-note": "Find One Note",
    "pitch-movement": "Pitch Movement"
  },
  difficulty: {
    beginner: "Beginner",
    intermediate: "Intermediate"
  }
};

let audioContext;
let mysteryNoteIndex = chooseRandomNoteIndex();
let startNoteIndex = mysteryNoteIndex;
let startNoteLabel = notes[startNoteIndex].label;
let movementStep = 0;
let pitchMovementPhase = "choose-start";
let hasPlayedMysteryNote = false;
let lastGuessIndex = null;

function getActiveNoteIndexes() {
  if (settings.difficulty === "beginner") {
    return notes
      .map((note, index) => ({ note, index }))
      .filter((item) => item.note.keyType === "white")
      .map((item) => item.index);
  }

  return notes.map((note, index) => index);
}

function chooseRandomNoteIndex() {
  const activeNoteIndexes = getActiveNoteIndexes();
  const randomIndex = Math.floor(Math.random() * activeNoteIndexes.length);

  return activeNoteIndexes[randomIndex];
}

function getMovementOptions() {
  if (settings.difficulty === "beginner") {
    return [-2, -1, 1, 2];
  }

  return [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
}

function getMovementChallengesForStart(startIndex) {
  const activeNoteIndexes = getActiveNoteIndexes();
  const movementOptions = getMovementOptions();

  return movementOptions
    .map((indexOffset) => {
      const targetIndex = startIndex + indexOffset;

      return {
        startIndex,
        indexOffset,
        targetIndex,
        semitoneDistance: targetIndex - startIndex
      };
    })
    .filter((challenge) => activeNoteIndexes.includes(challenge.targetIndex));
}

function chooseMovementChallengeForStart(startIndex) {
  const possibleChallenges = getMovementChallengesForStart(startIndex);

  return possibleChallenges[Math.floor(Math.random() * possibleChallenges.length)];
}

function chooseStartNoteLabel() {
  const usableLabels = getActiveNoteIndexes()
    .filter((startIndex) => getMovementChallengesForStart(startIndex).length > 0)
    .map((startIndex) => notes[startIndex].label);
  const uniqueLabels = [...new Set(usableLabels)];

  return uniqueLabels[Math.floor(Math.random() * uniqueLabels.length)];
}

function describeMovement(step) {
  const direction = step > 0 ? "up" : "down";
  const stepCount = Math.abs(step);
  let distance = `${stepCount} half steps`;

  if (stepCount === 1) {
    distance = "a half step";
  }

  if (stepCount === 2) {
    distance = "a whole step";
  }

  return `Go ${direction} ${distance}`;
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

function showSuccessMoment(noteLabel) {
  const successMessage = "You got it!";

  successTitle.textContent = "";

  successMessage.split("").forEach((letter, index) => {
    const letterSpan = document.createElement("span");

    letterSpan.textContent = letter === " " ? "\u00a0" : letter;
    letterSpan.style.setProperty("--letter-index", index);
    successTitle.appendChild(letterSpan);
  });

  successNote.textContent = `Solved note: ${noteLabel}`;
  successMoment.classList.remove("hidden");
}

function hideSuccessMoment() {
  successMoment.classList.add("hidden");
}

function showFeedback(message, type, noteLabel) {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;

  if (type === "correct") {
    showSuccessMoment(noteLabel);
  } else {
    hideSuccessMoment();
  }
}

function updateModeText() {
  if (settings.mode === "pitch-movement") {
    instructions.textContent = "Tap the starting note on the piano. Then follow the movement command.";
    movementCommand.textContent = pitchMovementPhase === "choose-start"
      ? `Start at ${startNoteLabel}`
      : describeMovement(movementStep);
    movementCommand.classList.remove("hidden");
    playButton.classList.add("hidden");
    replayNoteButton.textContent = "Replay Starting Note";
    return;
  }

  instructions.textContent = "Press Play Note, listen carefully, then tap the piano key that matches the mystery note.";
  movementCommand.classList.add("hidden");
  playButton.classList.remove("hidden");
  playButton.textContent = "Play Note";
  replayNoteButton.textContent = "Replay Note";
}

function hideListeningTools() {
  listeningTools.classList.add("hidden");
  compareTools.classList.add("hidden");
  lastGuessIndex = null;
}

function showReplayTool() {
  listeningTools.classList.remove("hidden");
}

function showCompareTools() {
  showReplayTool();
  compareTools.classList.remove("hidden");
}

function playMysteryNote() {
  const noteToPlay = settings.mode === "pitch-movement" ? startNoteIndex : mysteryNoteIndex;

  playFrequency(notes[noteToPlay].frequency);
}

function playLastGuess() {
  if (lastGuessIndex === null) {
    return;
  }

  playFrequency(notes[lastGuessIndex].frequency);
}

function updatePracticeSummary() {
  const instrument = settingLabels.instrument[settings.instrument];
  const mode = settingLabels.mode[settings.mode];
  const difficulty = settingLabels.difficulty[settings.difficulty];

  practiceSummary.textContent = `${instrument} - ${mode} - ${difficulty}`;
}

function resetPracticeRound() {
  if (settings.mode === "pitch-movement") {
    startNoteLabel = chooseStartNoteLabel();
    startNoteIndex = getActiveNoteIndexes().find((index) => notes[index].label === startNoteLabel);
    movementStep = 0;
    mysteryNoteIndex = startNoteIndex;
    pitchMovementPhase = "choose-start";
  } else {
    mysteryNoteIndex = chooseRandomNoteIndex();
    startNoteIndex = mysteryNoteIndex;
    startNoteLabel = notes[startNoteIndex].label;
    movementStep = 0;
    pitchMovementPhase = "choose-start";
  }

  hasPlayedMysteryNote = false;
  playButton.disabled = false;
  hideListeningTools();
  updateKeyboardAvailability();
  updateModeText();
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

  resetPracticeRound();
}

function handleGuess(guessedNoteIndex) {
  if (settings.mode !== "pitch-movement" && !hasPlayedMysteryNote) {
    showFeedback("Press Play Note first.", "");
    return;
  }

  playFrequency(notes[guessedNoteIndex].frequency);

  if (settings.mode === "pitch-movement" && pitchMovementPhase === "choose-start") {
    if (notes[guessedNoteIndex].label !== startNoteLabel) {
      showFeedback(`Find ${startNoteLabel} first.`, "hint");
      return;
    }

    const challenge = chooseMovementChallengeForStart(guessedNoteIndex);

    startNoteIndex = guessedNoteIndex;
    movementStep = challenge.semitoneDistance;
    mysteryNoteIndex = challenge.targetIndex;
    pitchMovementPhase = "choose-destination";
    updateModeText();
    showFeedback("Starting note found. Now move from there.", "");
    return;
  }

  if (guessedNoteIndex === mysteryNoteIndex) {
    showFeedback(`Correct - ${notes[mysteryNoteIndex].label}`, "correct", notes[mysteryNoteIndex].label);
    if (settings.mode === "pitch-movement") {
      startNoteLabel = chooseStartNoteLabel();
      startNoteIndex = getActiveNoteIndexes().find((index) => notes[index].label === startNoteLabel);
      movementStep = 0;
      mysteryNoteIndex = startNoteIndex;
      pitchMovementPhase = "choose-start";
    } else {
      mysteryNoteIndex = chooseRandomNoteIndex();
      startNoteIndex = mysteryNoteIndex;
      startNoteLabel = notes[startNoteIndex].label;
      movementStep = 0;
      pitchMovementPhase = "choose-start";
    }

    hasPlayedMysteryNote = false;
    playButton.disabled = false;
    hideListeningTools();
    updateModeText();
    return;
  }

  lastGuessIndex = guessedNoteIndex;
  showCompareTools();

  if (guessedNoteIndex > mysteryNoteIndex) {
    showFeedback("Almost - listen lower", "hint");
  } else {
    showFeedback("Almost - listen higher", "hint");
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
    key.dataset.noteIndex = index;
    key.setAttribute("aria-label", `Guess ${note.label}`);
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
    key.dataset.noteIndex = index;
    key.style.setProperty("--key-left", `${note.position}%`);
    key.setAttribute("aria-label", `Guess ${note.label}`);
    key.addEventListener("click", () => handleGuess(index));

    keyboard.appendChild(key);
  });
}

function updateKeyboardAvailability() {
  const blackKeysEnabled = settings.difficulty !== "beginner";

  keyboard.querySelectorAll(".black-key").forEach((key) => {
    key.disabled = !blackKeysEnabled;
    key.setAttribute("aria-disabled", String(!blackKeysEnabled));
  });
}

playButton.addEventListener("click", () => {
  playMysteryNote();
  hasPlayedMysteryNote = true;
  playButton.disabled = true;
  showReplayTool();
  compareTools.classList.add("hidden");
  lastGuessIndex = null;
  showFeedback("Find that note on the keyboard.", "");
});

replayNoteButton.addEventListener("click", playMysteryNote);
playYourGuessButton.addEventListener("click", playLastGuess);
startPracticeButton.addEventListener("click", startPractice);
backToMenuButton.addEventListener("click", showMenu);

settingOptions.forEach((option) => {
  option.addEventListener("click", () => handleSettingChoice(option));
});

createKeyboard();
updateKeyboardAvailability();
updatePracticeSummary();
updateModeText();
