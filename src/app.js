const { playFrequency } = window.MelodyAudio;
const {
  advancedMovementTimeLimit,
  notes,
  rankLevels,
  settingLabels,
  streakTargets,
  successMessages
} = window.MelodyConfig;
const {
  cloneFreshLearningProfile,
  getFocusInsight,
  getStrongestNoteInsight,
  recordAttemptInProfile,
  recordLearningAttempt
} = window.MelodyLearningProfile;

const playButton = document.querySelector("#play-note");
const instructions = document.querySelector("#instructions");
const movementCommand = document.querySelector("#movement-command");
const feedback = document.querySelector("#feedback");
const successMoment = document.querySelector("#success-moment");
const successTitle = document.querySelector(".success-title");
const challengeComplete = document.querySelector("#challenge-complete");
const challengeCompleteCopy = document.querySelector("#challenge-complete-copy");
const aimHigherButton = document.querySelector("#aim-higher");
const viewSummaryButton = document.querySelector("#view-summary");
const continueChallengeButton = document.querySelector("#continue-challenge");
const sessionSummary = document.querySelector("#session-summary");
const summaryTakeaway = document.querySelector("#summary-takeaway");
const summarySolves = document.querySelector("#summary-solves");
const summaryMisses = document.querySelector("#summary-misses");
const summaryAccuracy = document.querySelector("#summary-accuracy");
const summaryBestStreak = document.querySelector("#summary-best-streak");
const summaryRank = document.querySelector("#summary-rank");
const summaryStrength = document.querySelector("#summary-strength");
const summaryFocus = document.querySelector("#summary-focus");
const summaryMenuButton = document.querySelector("#summary-menu");
const summaryContinueButton = document.querySelector("#summary-continue");
const keyboard = document.querySelector("#keyboard");
const listeningTools = document.querySelector("#listening-tools");
const compareTools = document.querySelector("#compare-tools");
const replayNoteButton = document.querySelector("#replay-note");
const playYourGuessButton = document.querySelector("#play-your-guess");
const menuScreen = document.querySelector("#menu-screen");
const challengeScreen = document.querySelector("#challenge-screen");
const practiceScreen = document.querySelector("#practice-screen");
const startPracticeButton = document.querySelector("#start-practice");
const startSelectedChallengeButton = document.querySelector("#start-selected-challenge");
const backToStartButton = document.querySelector("#back-to-start");
const backToMenuButton = document.querySelector("#back-to-menu");
const practiceSummary = document.querySelector("#practice-summary");
const rankLabel = document.querySelector("#rank-label");
const streakCount = document.querySelector("#streak-count");
const accuracyRate = document.querySelector("#accuracy-rate");
const attemptCount = document.querySelector("#attempt-count");
const missCount = document.querySelector("#miss-count");
const timerStat = document.querySelector("#timer-stat");
const timerCount = document.querySelector("#timer-count");
const strengthInsight = document.querySelector("#strength-insight");
const focusInsight = document.querySelector("#focus-insight");
const profileStrengthInsight = document.querySelector("#profile-strength-insight");
const profileFocusInsight = document.querySelector("#profile-focus-insight");
const settingOptions = document.querySelectorAll(".setting-option");

const settings = {
  instrument: "piano",
  mode: "single-note",
  difficulty: "beginner",
  streakTarget: "5"
};

let mysteryNoteIndex = chooseRandomNoteIndex();
let startNoteIndex = mysteryNoteIndex;
let startNoteLabel = notes[startNoteIndex].label;
let movementStep = 0;
let pitchMovementPhase = "choose-start";
let hasPlayedMysteryNote = false;
let lastGuessIndex = null;
let sessionStats = createFreshSessionStats();
let sessionLearningProfile = cloneFreshLearningProfile();
let challengeFinished = false;
let movementTimerId = null;
let movementTimeLeft = advancedMovementTimeLimit;

function isStreakChallengeMode() {
  return settings.mode === "single-note" && settings.difficulty !== "beginner";
}

function isAdvancedPitchMovementMode() {
  return settings.mode === "pitch-movement" && settings.difficulty === "advanced";
}

function createFreshSessionStats() {
  return {
    solved: 0,
    misses: 0,
    currentStreak: 0,
    bestStreak: 0,
    rankIndex: 0,
    roundMisses: 0
  };
}

function getDefaultStrengthInsight() {
  return "Solve a few notes to reveal your strengths.";
}

function getDefaultFocusInsight() {
  return "Misses will show which notes need attention.";
}

function updateLearningInsights() {
  const hasSessionAttempts = getSessionAttempts() > 0;

  strengthInsight.textContent = hasSessionAttempts
    ? getStrongestNoteInsight(sessionLearningProfile)
    : getDefaultStrengthInsight();
  focusInsight.textContent = hasSessionAttempts
    ? getFocusInsight(sessionLearningProfile)
    : getDefaultFocusInsight();
}

function updateProfileCard() {
  profileStrengthInsight.textContent = getStrongestNoteInsight();
  profileFocusInsight.textContent = getFocusInsight();
}

function getVisibleNoteIndexes() {
  if (settings.difficulty !== "advanced") {
    return notes
      .map((note, index) => ({ note, index }))
      .filter((item) => item.note.octave === 4 || item.note.name === "C5")
      .map((item) => item.index);
  }

  return notes.map((note, index) => index);
}

function getActiveNoteIndexes() {
  const visibleNoteIndexes = getVisibleNoteIndexes();

  if (settings.difficulty !== "advanced") {
    return visibleNoteIndexes
      .filter((noteIndex) => notes[noteIndex].keyType === "white");
  }

  return visibleNoteIndexes;
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

  if (settings.difficulty === "advanced") {
    return [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
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

  if (stepCount === 12) {
    distance = "an octave";
  }

  return `Go ${direction} ${distance}`;
}

function chooseRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

function revealNoteOnKey(noteIndex) {
  clearRevealedKeys();

  const key = keyboard.querySelector(`[data-note-index="${noteIndex}"]`);

  if (!key) {
    return;
  }

  key.textContent = notes[noteIndex].label;
  key.classList.add("revealed");
}

function clearRevealedKeys() {
  keyboard.querySelectorAll(".key.revealed, .key.solved-key").forEach((key) => {
    key.classList.remove("revealed");
    key.classList.remove("solved-key");
    key.textContent = "";
  });
}

function celebrateKey(noteIndex) {
  const key = keyboard.querySelector(`[data-note-index="${noteIndex}"]`);

  if (!key) {
    return;
  }

  key.classList.remove("solved-key");
  void key.offsetWidth;
  key.classList.add("solved-key");
}

function showSuccessMoment(message) {
  successMoment.classList.add("hidden");
  void successMoment.offsetWidth;
  successTitle.textContent = "";

  message.split("").forEach((letter, index) => {
    const letterSpan = document.createElement("span");

    letterSpan.textContent = letter === " " ? "\u00a0" : letter;
    letterSpan.style.setProperty("--letter-index", index);
    successTitle.appendChild(letterSpan);
  });

  successMoment.classList.remove("hidden");
}

function hideSuccessMoment() {
  successMoment.classList.add("hidden");
}

function hideChallengeComplete() {
  challengeComplete.classList.add("hidden");
}

function hideSessionSummary() {
  sessionSummary.classList.add("hidden");
}

function stopMovementTimer() {
  if (movementTimerId) {
    clearInterval(movementTimerId);
    movementTimerId = null;
  }
}

function updateTimerDisplay() {
  timerStat.classList.toggle("hidden", !isAdvancedPitchMovementMode());
  timerStat.classList.toggle("urgent", movementTimeLeft <= 3);
  timerCount.textContent = isAdvancedPitchMovementMode() ? `${movementTimeLeft}s` : "--";
}

function handleTimerExpired() {
  stopMovementTimer();
  recordMiss();
  recordLearningAttempt(mysteryNoteIndex, null, false);
  recordAttemptInProfile(sessionLearningProfile, mysteryNoteIndex, null, false);
  updateLearningInsights();
  updateProfileCard();
  lastGuessIndex = null;
  showReplayTool();
  showFeedback("Time ran out. Try the movement again.", "hint");
  pitchMovementPhase = "choose-start";
  startNoteLabel = chooseStartNoteLabel();
  startNoteIndex = getActiveNoteIndexes().find((index) => notes[index].label === startNoteLabel);
  movementStep = 0;
  mysteryNoteIndex = startNoteIndex;
  movementTimeLeft = advancedMovementTimeLimit;
  clearRevealedKeys();
  updateModeText();
  updateTimerDisplay();
}

function startMovementTimer() {
  stopMovementTimer();

  if (!isAdvancedPitchMovementMode()) {
    movementTimeLeft = advancedMovementTimeLimit;
    updateTimerDisplay();
    return;
  }

  movementTimeLeft = advancedMovementTimeLimit;
  updateTimerDisplay();

  movementTimerId = setInterval(() => {
    movementTimeLeft -= 1;
    updateTimerDisplay();

    if (movementTimeLeft <= 0) {
      handleTimerExpired();
    }
  }, 1000);
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;

  if (type !== "correct") {
    hideSuccessMoment();
  }
}

function updateModeText() {
  if (challengeFinished) {
    instructions.textContent = "Challenge complete. Choose whether to aim higher or keep practicing this streak.";
    playButton.disabled = true;
    return;
  }

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

function getSessionAccuracy() {
  const totalAttempts = getSessionAttempts();

  if (totalAttempts === 0) {
    return 100;
  }

  return Math.round((sessionStats.solved / totalAttempts) * 100);
}

function getSessionAttempts() {
  return sessionStats.solved + sessionStats.misses;
}

function updateRank() {
  const accuracy = getSessionAccuracy();

  rankLevels.forEach((rank, index) => {
    const qualifiesForRank = sessionStats.solved >= rank.minSolved
      && accuracy >= rank.minAccuracy
      && sessionStats.bestStreak >= rank.minBestStreak;

    if (qualifiesForRank && index > sessionStats.rankIndex) {
      sessionStats.rankIndex = index;
    }
  });
}

function updateSessionPanel() {
  const streakTarget = Number(settings.streakTarget);

  rankLabel.textContent = rankLevels[sessionStats.rankIndex].name;
  streakCount.textContent = isStreakChallengeMode()
    ? `${sessionStats.currentStreak} / ${streakTarget}`
    : sessionStats.currentStreak;
  accuracyRate.textContent = `${getSessionAccuracy()}%`;
  attemptCount.textContent = getSessionAttempts();
  missCount.textContent = sessionStats.misses;
  updateTimerDisplay();
}

function getSolveMessage() {
  if (sessionStats.roundMisses === 0) {
    return chooseRandomMessage(successMessages.clean);
  }

  if (sessionStats.roundMisses === 1) {
    return chooseRandomMessage(successMessages.recovery);
  }

  return chooseRandomMessage(successMessages.solved);
}

function recordCorrectAnswer() {
  const cleanSolve = sessionStats.roundMisses === 0;

  sessionStats.solved += 1;

  if (cleanSolve) {
    sessionStats.currentStreak += 1;
  } else {
    sessionStats.currentStreak = 0;
  }

  sessionStats.bestStreak = Math.max(sessionStats.bestStreak, sessionStats.currentStreak);
  updateRank();
  updateSessionPanel();
}

function recordMiss() {
  sessionStats.misses += 1;
  sessionStats.roundMisses += 1;
  sessionStats.currentStreak = 0;
  updateSessionPanel();
}

function completeChallenge() {
  const streakTarget = Number(settings.streakTarget);

  if (!isStreakChallengeMode()) {
    return;
  }

  challengeFinished = true;
  hideSuccessMoment();
  hideListeningTools();
  playButton.disabled = true;
  showFeedback("", "");
  challengeCompleteCopy.textContent = `You reached ${streakTarget} clean answers in a row.`;
  challengeComplete.classList.add("hidden");
  void challengeComplete.offsetWidth;
  challengeComplete.classList.remove("hidden");
  updateModeText();
}

function startFreshSession() {
  challengeFinished = false;
  sessionStats = createFreshSessionStats();
  sessionLearningProfile = cloneFreshLearningProfile();
  hideChallengeComplete();
  updatePracticeSummary();
  updateSessionPanel();
  resetPracticeRound();
}

function chooseNextStreakTarget() {
  const currentTarget = Number(settings.streakTarget);
  const nextTarget = streakTargets.find((target) => target > currentTarget) || currentTarget + 10;

  settings.streakTarget = String(nextTarget);
  settingLabels.streakTarget[settings.streakTarget] = `${nextTarget} Streak`;

  document.querySelectorAll('[data-setting="streakTarget"]').forEach((settingOption) => {
    const isSelected = settingOption.dataset.value === settings.streakTarget;

    settingOption.classList.toggle("selected", isSelected);
    settingOption.setAttribute("aria-pressed", String(isSelected));
  });
}

function updatePracticeSummary() {
  const instrument = settingLabels.instrument[settings.instrument];
  const mode = settingLabels.mode[settings.mode];
  const difficulty = settingLabels.difficulty[settings.difficulty];
  const challenge = settingLabels.streakTarget[settings.streakTarget];

  practiceSummary.textContent = isStreakChallengeMode()
    ? `${instrument} - ${mode} - ${difficulty} - ${challenge}`
    : `${instrument} - ${mode} - ${difficulty}`;
}

function getSessionTakeaway() {
  const attempts = getSessionAttempts();
  const accuracy = getSessionAccuracy();

  if (attempts === 0) {
    return "No practice recorded yet.";
  }

  if (accuracy >= 85 && sessionStats.bestStreak >= 3) {
    return "Strong session. Your ear stayed accurate under pressure.";
  }

  if (sessionStats.misses > sessionStats.solved) {
    return "Useful reps. Your misses are showing the next notes to study.";
  }

  if (sessionStats.bestStreak >= 3) {
    return "Good momentum. You are starting to hear the pattern faster.";
  }

  return "Good session. Keep building the connection between sound and key.";
}

function updateSessionSummary() {
  const hasSessionAttempts = getSessionAttempts() > 0;

  summaryTakeaway.textContent = getSessionTakeaway();
  summarySolves.textContent = sessionStats.solved;
  summaryMisses.textContent = sessionStats.misses;
  summaryAccuracy.textContent = `${getSessionAccuracy()}%`;
  summaryBestStreak.textContent = sessionStats.bestStreak;
  summaryRank.textContent = rankLevels[sessionStats.rankIndex].name;
  summaryStrength.textContent = hasSessionAttempts
    ? getStrongestNoteInsight(sessionLearningProfile)
    : getDefaultStrengthInsight();
  summaryFocus.textContent = hasSessionAttempts
    ? getFocusInsight(sessionLearningProfile)
    : getDefaultFocusInsight();
}

function showSessionSummary() {
  stopMovementTimer();
  hideSuccessMoment();
  hideChallengeComplete();
  updateSessionSummary();
  sessionSummary.classList.remove("hidden");
}

function continueFromSessionSummary() {
  hideSessionSummary();

  if (challengeFinished) {
    startFreshSession();
    return;
  }

  if (isAdvancedPitchMovementMode() && pitchMovementPhase === "choose-destination") {
    startMovementTimer();
  }
}

function returnToMenuFromSummary() {
  hideSessionSummary();
  showMenu();
}

function handleBackToMenu() {
  if (getSessionAttempts() > 0) {
    showSessionSummary();
    return;
  }

  showMenu();
}

function updateStartButtonText() {
  startPracticeButton.textContent = "Start Practice";
}

function resetPracticeRound() {
  sessionStats.roundMisses = 0;
  hideChallengeComplete();
  hideSessionSummary();
  stopMovementTimer();
  movementTimeLeft = advancedMovementTimeLimit;
  createKeyboard();

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
  updateSessionPanel();
  updateLearningInsights();
  showFeedback("Ready when you are.", "");
}

function showMenu() {
  challengeScreen.classList.add("hidden");
  practiceScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
  updateProfileCard();
  resetPracticeRound();
}

function showChallengeScreen() {
  menuScreen.classList.add("hidden");
  challengeScreen.classList.remove("hidden");
}

function handleStartPractice() {
  if (isStreakChallengeMode()) {
    showChallengeScreen();
    return;
  }

  startPractice();
}

function startPractice() {
  startFreshSession();
  challengeScreen.classList.add("hidden");
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

  updatePracticeSummary();
  updateSessionPanel();
  updateStartButtonText();
  resetPracticeRound();
}

function handleGuess(guessedNoteIndex) {
  if (challengeFinished) {
    showFeedback("Challenge complete. Choose your next move.", "");
    return;
  }

  if (settings.mode !== "pitch-movement" && !hasPlayedMysteryNote) {
    showFeedback("Press Play Note first.", "");
    return;
  }

  playFrequency(notes[guessedNoteIndex].frequency);

  if (settings.mode === "pitch-movement" && pitchMovementPhase === "choose-start") {
    if (notes[guessedNoteIndex].label !== startNoteLabel) {
      recordMiss();
      showFeedback(`Find ${startNoteLabel} first.`, "hint");
      return;
    }

    const challenge = chooseMovementChallengeForStart(guessedNoteIndex);

    startNoteIndex = guessedNoteIndex;
    movementStep = challenge.semitoneDistance;
    mysteryNoteIndex = challenge.targetIndex;
    pitchMovementPhase = "choose-destination";
    clearRevealedKeys();
    updateModeText();
    startMovementTimer();
    showFeedback("Starting note found.", "");
    return;
  }

  if (guessedNoteIndex === mysteryNoteIndex) {
    const solveMessage = getSolveMessage();

    recordCorrectAnswer();
    recordLearningAttempt(mysteryNoteIndex, guessedNoteIndex, true);
    recordAttemptInProfile(sessionLearningProfile, mysteryNoteIndex, guessedNoteIndex, true);
    updateLearningInsights();
    updateProfileCard();
    stopMovementTimer();
    movementTimeLeft = advancedMovementTimeLimit;

    if (settings.difficulty !== "advanced") {
      revealNoteOnKey(mysteryNoteIndex);
    } else {
      clearRevealedKeys();
    }

    celebrateKey(mysteryNoteIndex);
    showFeedback("", "");
    showSuccessMoment(solveMessage);

    if (isStreakChallengeMode() && sessionStats.currentStreak >= Number(settings.streakTarget)) {
      completeChallenge();
      return;
    }

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
    sessionStats.roundMisses = 0;
    return;
  }

  recordMiss();
  recordLearningAttempt(mysteryNoteIndex, guessedNoteIndex, false);
  recordAttemptInProfile(sessionLearningProfile, mysteryNoteIndex, guessedNoteIndex, false);
  updateLearningInsights();
  updateProfileCard();
  stopMovementTimer();
  movementTimeLeft = advancedMovementTimeLimit;
  lastGuessIndex = guessedNoteIndex;
  showCompareTools();

  if (guessedNoteIndex > mysteryNoteIndex) {
    showFeedback("Clue: listen lower", "hint");
  } else {
    showFeedback("Clue: listen higher", "hint");
  }

  if (isAdvancedPitchMovementMode()) {
    pitchMovementPhase = "choose-start";
    startNoteLabel = chooseStartNoteLabel();
    startNoteIndex = getActiveNoteIndexes().find((index) => notes[index].label === startNoteLabel);
    movementStep = 0;
    mysteryNoteIndex = startNoteIndex;
    updateModeText();
    updateTimerDisplay();
  }
}

function createKeyboard() {
  const visibleNoteIndexes = getVisibleNoteIndexes();
  const visibleWhiteKeyIndexes = visibleNoteIndexes.filter((noteIndex) => notes[noteIndex].keyType === "white");
  const blackKeyWidth = (100 / visibleWhiteKeyIndexes.length) * 0.64;

  keyboard.innerHTML = "";
  keyboard.style.setProperty("--black-key-width", `${blackKeyWidth}%`);
  keyboard.classList.toggle("expanded-keyboard", settings.difficulty === "advanced");

  visibleNoteIndexes.forEach((index) => {
    const note = notes[index];

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

  visibleNoteIndexes.forEach((index) => {
    const note = notes[index];

    if (note.keyType !== "black") {
      return;
    }

    const key = document.createElement("button");
    const whiteKeysBefore = visibleWhiteKeyIndexes.filter((whiteKeyIndex) => whiteKeyIndex < index).length;
    const blackKeyPosition = (whiteKeysBefore / visibleWhiteKeyIndexes.length) * 100;

    key.className = "key black-key";
    key.type = "button";
    key.dataset.noteIndex = index;
    key.style.setProperty("--key-left", `${blackKeyPosition}%`);
    key.setAttribute("aria-label", `Guess ${note.label}`);
    key.addEventListener("click", () => handleGuess(index));

    keyboard.appendChild(key);
  });
}

function updateKeyboardAvailability() {
  const blackKeysEnabled = settings.difficulty === "advanced";

  keyboard.querySelectorAll(".black-key").forEach((key) => {
    key.disabled = !blackKeysEnabled;
    key.setAttribute("aria-disabled", String(!blackKeysEnabled));
  });
}

playButton.addEventListener("click", () => {
  clearRevealedKeys();
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
startPracticeButton.addEventListener("click", handleStartPractice);
startSelectedChallengeButton.addEventListener("click", startPractice);
backToStartButton.addEventListener("click", showMenu);
backToMenuButton.addEventListener("click", handleBackToMenu);
aimHigherButton.addEventListener("click", () => {
  chooseNextStreakTarget();
  startFreshSession();
});
viewSummaryButton.addEventListener("click", showSessionSummary);
continueChallengeButton.addEventListener("click", startFreshSession);
summaryMenuButton.addEventListener("click", returnToMenuFromSummary);
summaryContinueButton.addEventListener("click", continueFromSessionSummary);

settingOptions.forEach((option) => {
  option.addEventListener("click", () => handleSettingChoice(option));
});

createKeyboard();
updateKeyboardAvailability();
updatePracticeSummary();
updateStartButtonText();
updateModeText();
updateLearningInsights();
updateProfileCard();
