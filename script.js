// Game Constants
const themes = {
  sinhala: ['අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'එ', 'ඔ', 'ක', 'ග', 'ච', 'ජ', 'ට', 'ඩ'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
  fruits: ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍉', '🍇', '🍐', '🍑', '🥭', '🍍', '🥥', '🥝', '🍏', '🍈'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
  vehicles: ['🚗', '🚕', '🚙', '🚌', '🚑', '🚒', '🚲', '🏍', '✈️', '🚀', '🛳', '🚁', '🚚', '🚜', '🏎', '🛵'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥊'],
  foods: ['🍔', '🍕', '🌭', '🥪', '🍣', '🍛', '🍜', '🍝', '🍠', '🍦', '🍩', '🍪', '🎂', '🍫', '🍬', '🍭'],
  professions: ['👮‍♂️', '👷‍♀️', '👨‍⚕️', '👩‍🍳', '👨‍🔧', '👩‍🎓', '👨‍💻', '👩‍🎨', '👨‍🚀', '👩‍✈️', '👨‍🔬', '👩‍💼', '👨‍🏫', '👩‍🔧', '👨‍🎤', '👩‍🚒'],
  flags: ['🇱🇰', '🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇯🇵', '🇰🇷', '🇧🇷', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇷🇺', '🇨🇳', '🇿🇦'],
  music: ['🎹', '🥁', '🎸', '🎷', '🎺', '🎻', '🪕', '🎼', '🎤', '🎧', '📯', '🪘', '🎚️', '🎛️', '🎵', '🎶'],
  nature: ['🌲', '🌳', '🌴', '🌱', '🌷', '🌸', '🌹', '🍀', '🌻', '🌼', '🌞', '🌛', '🌍', '🌊', '🔥', '❄️']
};

const themeNames = {
  sinhala: 'සිංහල අක්ෂර',
  numbers: 'අංක',
  fruits: 'පළතුරු',
  animals: 'සතුන්',
  vehicles: 'වාහන',
  sports: 'ක්‍රීඩා',
  foods: 'ආහාර',
  professions: 'වෘත්තීන්',
  flags: 'ජාතික ධජ',
  music: 'සංගීත භාණ්ඩ',
  nature: 'ප්‍රකෘතිය'
};

const CLASSIC_UNLOCK_REQUIREMENT = 10;
const CLASSIC_TIME_LIMIT = 60;
const DAILY_CHALLENGE_REWARD = 10;
const THEME_PRICES = {
  professions: 50,
  flags: 100,
  music: 150,
  nature: 200
};

// DOM Elements
const board = document.getElementById("gameBoard");
const matchSound = document.getElementById("matchSound");
const mismatchSound = document.getElementById("mismatchSound");
const winSound = document.getElementById("winSound");
const flipSound = document.getElementById("flipSound");
const timerDisplay = document.getElementById("timer");
const attemptsDisplay = document.getElementById("attempts");
const matchesDisplay = document.getElementById("matches");
const totalPairsDisplay = document.getElementById("totalPairs");
const leaderboard = document.getElementById("leaderboard");
const coinDisplay = document.getElementById("coinCount");
const shopCoinDisplay = document.getElementById("shopCoinCount");
const themeSelect = document.getElementById('themeSelect'); // New reference

// Game State
let timer, time = 0, attempts = 0, matches = 0, totalPairs = 0;
let currentTheme = 'sinhala';
let soundEnabled = true;
let darkMode = false;
let cardSize = 80;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let deferredPrompt;
let easyRoundsCompleted = 0;
let classicUnlocked = false;
let helperInterval;
let classicTimeout;
let playerCoins = 0;
let dailyChallengeCompleted = false;
let unlockedThemes = ['sinhala', 'numbers', 'fruits', 'animals', 'vehicles', 'sports', 'foods'];
let currentLevel = 1;
let currentPoints = 0;
let requiredPoints = 10;
let assistantPoints = 0;
const maxAssistantPoints = 40;
let previousBestTime = Infinity;
let classicBestTime = localStorage.getItem('classicBestTime') || Infinity;
let timeExtended = false;

// Initialize level system
function initLevelSystem() {
  const savedLevel = localStorage.getItem('currentLevel');
  const savedPoints = localStorage.getItem('currentPoints');
  const savedAssistant = localStorage.getItem('assistantPoints');
  
  if (savedLevel) currentLevel = parseInt(savedLevel);
  if (savedPoints) currentPoints = parseInt(savedPoints);
  if (savedAssistant) assistantPoints = parseInt(savedAssistant);
  
  requiredPoints = calculateRequiredPoints(currentLevel);
  updateLevelDisplay();
  updateAssistantDisplay();
}

// Initialize daily challenge
function initDailyChallenge() {
  const today = new Date().toDateString();
  const lastPlayed = localStorage.getItem('dailyChallengeDate');
  
  if (lastPlayed !== today) {
    dailyChallengeCompleted = false;
    localStorage.setItem('dailyChallengeDate', today);
  } else {
    dailyChallengeCompleted = localStorage.getItem('dailyChallengeCompleted') === 'true';
  }
}

function showDailyChallengeBadge() {
  if (dailyChallengeCompleted) return;
  
  const badge = document.createElement('div');
  badge.className = 'daily-challenge-badge';
  badge.textContent = 'දිනපතා අභියෝගය!';
  document.querySelector('.game-container').appendChild(badge);
}

function updateCoinDisplay() {
  coinDisplay.textContent = playerCoins;
  shopCoinDisplay.textContent = playerCoins;
}

function updateThemeSelect() {
  themeSelect.innerHTML = '';
  
  unlockedThemes.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = themeNames[theme];
    themeSelect.appendChild(option);
  });
  
  // Set current theme selection
  if (unlockedThemes.includes(currentTheme)) {
    themeSelect.value = currentTheme;
  } else if (unlockedThemes.length > 0) {
    currentTheme = unlockedThemes[0];
    themeSelect.value = currentTheme;
  }
  
  // Update shop buttons
  document.querySelectorAll('.theme-item').forEach(item => {
    const theme = item.dataset.theme;
    const button = item.querySelector('.buy-btn');
    
    if (unlockedThemes.includes(theme)) {
      button.disabled = true;
      button.textContent = 'හිමිකාරීත්වය';
    } else {
      button.disabled = false;
      button.textContent = 'මිලදී ගන්න';
    }
  });
}

// Calculate required points for level
function calculateRequiredPoints(level) {
  return 10 + (level - 1) * 5;
}

// Earn points after game completion
function earnPoints(difficulty, time) {
  let pointsEarned = 0;
  
  switch(difficulty) {
    case 'easy': pointsEarned = 2; break;
    case 'medium': pointsEarned = 3; break;
    case 'hard': pointsEarned = 4; break;
    case 'classic': pointsEarned = 5; break;
    case 'daily': pointsEarned = 3; break;
  }
  
  // Time bonus
  if (time < previousBestTime) {
    pointsEarned += 5;
    previousBestTime = time;
  }
  
  currentPoints += pointsEarned;
  
  // Check for level up
  if (currentPoints >= requiredPoints) {
    levelUp();
  }
  
  updateLevelDisplay();
  saveLevelProgress();
}

// Level up function
function levelUp() {
  currentLevel++;
  currentPoints = currentPoints - requiredPoints;
  requiredPoints = calculateRequiredPoints(currentLevel);
  
  // Play level up sound
  if (soundEnabled) {
    const levelUpSound = document.getElementById('levelUpSound');
    levelUpSound.currentTime = 0;
    levelUpSound.play();
  }
  
  // Show level up message
  showHelperMessage(`සුබ පතමු! ඔබ ලෙවල් ${currentLevel} ට උසස් විය!`, 4000);
}

// Earn assistant points
function earnAssistantPoints(difficulty, time) {
  let pointsEarned = 0;
  
  switch(difficulty) {
    case 'easy': pointsEarned = 2; break;
    case 'medium': pointsEarned = 4; break;
    case 'hard': pointsEarned = 6; break;
    case 'classic': pointsEarned = 10; break;
    case 'daily': pointsEarned = 5; break;
  }
  
  // Time bonus
  if (time < previousBestTime) {
    pointsEarned += 5;
  }
  
  assistantPoints += pointsEarned;
  
  // Cap at max
  if (assistantPoints > maxAssistantPoints) {
    assistantPoints = maxAssistantPoints;
  }
  
  updateAssistantDisplay();
  saveAssistantProgress();
  
  // Show assistant ready message
  if (assistantPoints >= maxAssistantPoints) {
    showHelperMessage("ඇසිස්ටන්ට් සූදානම්! උපදෙස් ලබා ගැනීමට ක්ලික් කරන්න", 4000);
    
    // Play assistant ready sound
    if (soundEnabled) {
      const assistantSound = document.getElementById('assistantSound');
      assistantSound.currentTime = 0;
      assistantSound.play();
    }
  }
}

// Update level display
function updateLevelDisplay() {
  document.querySelector('.level-value').textContent = currentLevel;
  document.querySelector('.points-value').textContent = currentPoints;
  document.querySelector('.points-total').textContent = requiredPoints;
  
  const progressPercent = (currentPoints / requiredPoints) * 100;
  document.querySelector('.progress-fill').style.width = `${progressPercent}%`;
}

// Update assistant display
function updateAssistantDisplay() {
  const progressPercent = (assistantPoints / maxAssistantPoints) * 100;
  const progressFill = document.querySelector('.assistant-progress .progress-fill');
  
  // Update circle progress
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progressPercent / 100) * circumference;
  
  progressFill.style.strokeDasharray = `${circumference} ${circumference}`;
  progressFill.style.strokeDashoffset = offset;
  
  // Change color when full
  if (assistantPoints >= maxAssistantPoints) {
    progressFill.style.stroke = '#FFC107';
  } else {
    progressFill.style.stroke = '#00796b';
  }
}

// Save progress to localStorage
function saveLevelProgress() {
  localStorage.setItem('currentLevel', currentLevel);
  localStorage.setItem('currentPoints', currentPoints);
  localStorage.setItem('requiredPoints', requiredPoints);
}

function saveAssistantProgress() {
  localStorage.setItem('assistantPoints', assistantPoints);
}

// Helper Messages
const helperMessages = {
  unlock: "සුභ පැතුම්! ඔබ පහසු මට්ටම 10 වතාවක් ජයග්‍රහණය කර ඇත. ඔබට දැන් සම්භාව්‍ය මට්ටමට පිවිසිය හැකිය!",
  intro: "මෙය සම්භාව්‍ය මට්ටමයි. කාඩ්පත් කෙටි වේලාවකට පෙන්වනු ලැබේ, පසුව ඒවා ආවරණය කරනු ලැබේ.",
  victory: "ප්‍රශංසා! ඔබ සම්භාව්‍ය මට්ටම ජයග්‍රහණය කළා!",
  timeUp: "කාලය ගෙවී ඇත! නැවත උත්සාහ කරන්න.",
  dailyComplete: "සුබ පැතුම්! ඔබ දිනපතා අභියෝගය ජයග්‍රහණය කළා. ඔබට 10 කාසි හිමි විය!"
};

// Initialize Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Helper Functions
function showHelperMessage(message, duration = 3000) {
  const helperDiv = document.createElement('div');
  helperDiv.className = 'helper-message';
  helperDiv.textContent = message;
  document.body.appendChild(helperDiv);
  
  setTimeout(() => {
    helperDiv.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    helperDiv.classList.remove('show');
    setTimeout(() => helperDiv.remove(), 500);
  }, duration);
}

function checkClassicUnlock() {
  if (easyRoundsCompleted >= CLASSIC_UNLOCK_REQUIREMENT && !classicUnlocked) {
    classicUnlocked = true;
    showHelperMessage(helperMessages.unlock, 5000);
    // Add classic level to select dropdown
    const levelSelect = document.getElementById('levelSelect');
    const classicOption = levelSelect.querySelector('option[value="classic"]');
    classicOption.classList.remove('classic-hidden');
  }
}

// Sound Control
document.getElementById('soundToggle').addEventListener('click', toggleSound);
function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById('soundToggle').textContent = 
    `ශබ්දය: ${soundEnabled ? 'සක්‍රීය' : 'අක්‍රීය'}`;
  localStorage.setItem('soundEnabled', soundEnabled);
}

// Dark Mode
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.setAttribute('data-theme', darkMode ? 'dark' : '');
  document.getElementById('darkModeToggle').textContent = 
    darkMode ? 'සාමාන්‍ය ප්‍රකාරය' : 'අඳුරු ප්‍රකාරය';
  localStorage.setItem('darkMode', darkMode);
}

// Card Size
document.getElementById('cardSize').addEventListener('input', updateCardSize);
function updateCardSize() {
  cardSize = parseInt(document.getElementById('cardSize').value);
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize}px`;
    card.style.fontSize = `${cardSize * 0.45}px`;
  });
  localStorage.setItem('cardSize', cardSize);
}

// හොඳම කාලය යාවත්කාලීන කිරීමේ ශ්රිතය
function updateBestTimeDisplay() {
  const bestTimeDisplay = document.getElementById('bestTimeDisplay');
  const bestTimeValue = document.getElementById('bestTimeValue');
  const level = document.getElementById('levelSelect').value;

  if (level === 'classic') {
    bestTimeDisplay.classList.remove('hidden');
    bestTimeValue.textContent = classicBestTime === Infinity ? '∞' : classicBestTime;
  } else {
    bestTimeDisplay.classList.add('hidden');
  }
}

// Game Functions
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateTimer() {
  const level = document.getElementById("levelSelect").value;
  
  if (level === 'classic' || level === 'daily') {
    // Count down for classic and daily modes
    time--;
    timerDisplay.textContent = time;
    
    // Add visual effect when time is low
    if (time <= 10) {
      timerDisplay.classList.add('time-low');
    } else {
      timerDisplay.classList.remove('time-low');
    }
    
    // Check if time is up
    if (time <= 0) {
      clearInterval(timer);
      time = 0;
      timerDisplay.textContent = time;
      lockBoard = true;
      showTimeUpMessage();
    }
  } else {
    // Count up for other levels
    time++;
    timerDisplay.textContent = time;
  }
}

function createBoard(level) {
  board.innerHTML = "";
  clearInterval(timer);
  clearTimeout(classicTimeout); // Clear any existing timeouts
  if (helperInterval) clearInterval(helperInterval);
  
  // Reset time based on level
  if (level === "classic") {
    time = CLASSIC_TIME_LIMIT;
  } else if (level === "daily") {
    time = 120; // 2 minutes for daily challenge
  } else {
    time = 0;
  }
  
  attempts = 0;
  matches = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  timeExtended = false;
  
  timerDisplay.textContent = time;
  attemptsDisplay.textContent = "0";
  matchesDisplay.textContent = "0";
  
  // Update best time display
  updateBestTimeDisplay();
  
  // Start timer based on level
  if (level !== "classic" && level !== "daily") {
    timer = setInterval(updateTimer, 1000);
  }

  // Get theme and validate
  let selectedTheme = themeSelect.value;
  if (unlockedThemes.includes(selectedTheme)) {
    currentTheme = selectedTheme;
  } else {
    // Fallback to first unlocked theme
    if (unlockedThemes.length > 0) {
      currentTheme = unlockedThemes[0];
      themeSelect.value = currentTheme;
    } else {
      currentTheme = 'sinhala';
    }
  }
  
  const emojis = themes[currentTheme];
  let pairCount, columns;

  if (level === "easy") {
    pairCount = 4;
    columns = 4;
  } else if (level === "medium") {
    pairCount = 8;
    columns = 4;
  } else if (level === "hard") {
    pairCount = 12;
    columns = 6;
  } else if (level === "classic") {
    pairCount = 8;
    columns = 4;
  } else if (level === "daily") {
    pairCount = 12;
    columns = 4;
    showDailyChallengeBadge();
  }

  totalPairs = pairCount;
  totalPairsDisplay.textContent = pairCount;
  board.style.gridTemplateColumns = `repeat(${columns}, ${cardSize}px)`;

  let selected = emojis.slice(0, pairCount);
  let cardValues = shuffle([...selected, ...selected]);

  cardValues.forEach((value) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.value = value;
    card.textContent = "?";
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize}px`;
    card.style.fontSize = `${cardSize * 0.45}px`;

    card.addEventListener("click", flipCard);
    card.addEventListener("touchstart", flipCard, { passive: true });
    board.appendChild(card);
  });

  // For classic level, show all cards briefly
  if (level === "classic") {
    showHelperMessage(helperMessages.intro, 4000);
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.textContent = card.dataset.value;
      card.classList.add('flipped');
    });
    
    classicTimeout = setTimeout(() => {
      cards.forEach(card => {
        card.textContent = '?';
        card.classList.remove('flipped');
      });
      // Start the countdown timer after cards flip back
      timer = setInterval(updateTimer, 1000);
    }, 5000);
  }
  
  // For daily challenge, start timer immediately
  if (level === "daily") {
    timer = setInterval(updateTimer, 1000);
  }
}

function flipCard() {
  if (lockBoard || this.classList.contains("flipped")) return;

  if (soundEnabled) {
    flipSound.currentTime = 0;
    flipSound.play().catch(e => console.log("Audio play failed:", e));
  }

  this.textContent = this.dataset.value;
  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;
  attempts++;
  attemptsDisplay.textContent = attempts;

  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    if (soundEnabled) {
      matchSound.currentTime = 0;
      matchSound.play();
    }
    matches++;
    matchesDisplay.textContent = matches;
    firstCard.removeEventListener("click", flipCard);
    firstCard.removeEventListener("touchstart", flipCard);
    secondCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("touchstart", flipCard);
    
    if (matches === totalPairs) {
      clearInterval(timer);
      clearTimeout(classicTimeout);
      if (helperInterval) clearInterval(helperInterval);
      
      // Track easy rounds for classic unlock
      const level = document.getElementById("levelSelect").value;
      if (level === "easy") {
        easyRoundsCompleted++;
        localStorage.setItem('easyRounds', easyRoundsCompleted);
        checkClassicUnlock();
      }
      
      // Calculate final time
      let finalTime = time;
      if (level === "classic" || level === "daily") {
        // For timed modes: time taken = total time - remaining time
        finalTime = level === "classic" ? CLASSIC_TIME_LIMIT - time : 120 - time;
        if (level === "classic") {
          afterClassicWin(finalTime);
          showHelperMessage(helperMessages.victory, 5000);
        }
      }
      
      if (soundEnabled) {
        winSound.currentTime = 0;
        winSound.play();
      }
      
      afterGameWin(finalTime, attempts);
      showWinMessage(finalTime, attempts);
      saveScore(finalTime, attempts);
    }
    
    resetBoard();
  } else {
    if (soundEnabled) {
      mismatchSound.currentTime = 0;
      mismatchSound.play();
    }
    setTimeout(() => {
      firstCard.textContent = "?";
      secondCard.textContent = "?";
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetBoard();
    }, 800);
  }
}

// After winning classic mode
function afterClassicWin(finalTime) {
  // Update best time if current time is better
  if (finalTime < classicBestTime) {
    classicBestTime = finalTime;
    localStorage.setItem('classicBestTime', classicBestTime);
    showHelperMessage(`නව කාල වාර්තාව! ${classicBestTime} තත්පර`, 4000);
    updateBestTimeDisplay(); // හොඳම කාලය යාවත්කාලීන කරන්න
  }
}

// After winning a game
function afterGameWin(time, attempts) {
  const level = document.getElementById("levelSelect").value;
  
  // Earn points
  earnPoints(level, time);
  earnAssistantPoints(level, time);
  
  // Daily challenge reward
  if (level === "daily" && !dailyChallengeCompleted) {
    playerCoins += DAILY_CHALLENGE_REWARD;
    dailyChallengeCompleted = true;
    localStorage.setItem('dailyChallengeCompleted', 'true');
    localStorage.setItem('playerCoins', playerCoins);
    updateCoinDisplay();
    
    showHelperMessage(helperMessages.dailyComplete, 5000);
    
  }
}

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Leaderboard Functions
function saveScore(time, attempts) {
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  const username = localStorage.getItem('username') || 'නාමරහිත';
  scores.push({ 
    username,
    time, 
    attempts, 
    theme: currentTheme,
    date: new Date().toLocaleDateString('si-LK'),
    level: document.getElementById('levelSelect').value
  });
  scores.sort((a, b) => a.time - b.time || a.attempts - b.attempts);
  localStorage.setItem("scores", JSON.stringify(scores.slice(0, 10)));
  renderLeaderboard();
}

function renderLeaderboard() {
  leaderboard.innerHTML = "";
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.forEach((score, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span class="rank">${index + 1}.</span>
      <span class="username">${score.username}</span>
      <span class="time">${score.time}s</span>
      <span class="attempts">${score.attempts} පි.</span>
      <span class="level">${getLevelName(score.level)}</span>
      <span class="theme">${themeNames[score.theme] || score.theme}</span>
      <span class="date">${score.date}</span>
    `;
    leaderboard.appendChild(item);
  });
}

function getLevelName(level) {
  switch(level) {
    case 'easy': return 'පහසු';
    case 'medium': return 'මධ්‍යම';
    case 'hard': return 'උපරිම';
    case 'classic': return 'සම්භාව්‍ය';
    case 'daily': return 'දිනපතා';
    default: return level;
  }
}

// UI Functions
function showWinMessage(finalTime, attempts) {
  document.getElementById('finalTime').textContent = finalTime;
  document.getElementById('finalAttempts').textContent = attempts;
  document.getElementById('winMessage').classList.add('show');
}

function hideWinMessage() {
  document.getElementById('winMessage').classList.remove('show');
}

function showTimeUpMessage() {
  document.getElementById('timeUpMatches').textContent = matches;
  document.getElementById('timeUpTotalPairs').textContent = totalPairs;
  document.getElementById('timeUpAttempts').textContent = attempts;
  
  document.getElementById('timeUpMessage').classList.add('show');
  
  // Play time up sound
  if (soundEnabled) {
    const timeUpSound = document.getElementById('timeUpSound');
    timeUpSound.currentTime = 0;
    timeUpSound.play();
  }
}

function hideTimeUpMessage() {
  document.getElementById('timeUpMessage').classList.remove('show');
}

function showInstructions() {
  document.getElementById('instructionsModal').classList.add('show');
}

function closeInstructions() {
  document.getElementById('instructionsModal').classList.remove('show');
}

function startGame() {
  const level = document.getElementById("levelSelect").value;
  createBoard(level);
  hideControls();
  document.getElementById("gameContainer").classList.add("game-focused");
  
  setTimeout(() => {
    document.getElementById("gameContainer").scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center'
    });
  }, 100);
}

function restartGame() {
  const level = document.getElementById("levelSelect").value;
  hideWinMessage();
  hideTimeUpMessage();
  createBoard(level);
  showControls();
  document.getElementById("gameContainer").classList.remove("game-focused");
}

function showControls() {
  document.querySelector(".controls").classList.remove("controls-collapsed");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideControls() {
  document.querySelector(".controls").classList.add("controls-collapsed");
}

// Username Functions
function checkUsername() {
  const savedUsername = localStorage.getItem('username');
  if (!savedUsername) {
    document.getElementById('usernameModal').classList.add('show');
  }
}

function saveUsername() {
  const username = document.getElementById('usernameInput').value.trim();
  if (username && username.length <= 20) {
    localStorage.setItem('username', username);
    document.getElementById('usernameModal').classList.remove('show');
    renderUsernameInHeader();
  } else {
    alert("කරුණාකර වලංගු නාමයක් ඇතුළත් කරන්න (උපරිම අක්ෂර 20)");
  }
}

function renderUsernameInHeader() {
  const username = localStorage.getItem('username');
  if (username) {
    const header = document.querySelector('.header');
    const usernameDisplay = document.createElement('div');
    usernameDisplay.className = 'username-display';
    usernameDisplay.textContent = `පරිශීලක: ${username}`;
    header.insertBefore(usernameDisplay, header.firstChild);
  }
}

// Toggle Functions
function initToggles() {
  // Leaderboard toggle
  document.getElementById('toggleLeaderboard').addEventListener('click', function() {
    this.classList.toggle('active');
    const container = document.getElementById('leaderboardContainer');
    container.classList.toggle('show');
    
    if (soundEnabled) {
      const toggleSound = document.getElementById('toggleSound');
      toggleSound.currentTime = 0;
      toggleSound.volume = 0.3;
      toggleSound.play().catch(e => console.log("Toggle sound failed:", e));
    }
  });

  // About page toggle
  document.getElementById('aboutToggle').addEventListener('click', function() {
    this.classList.toggle('active');
    const content = document.getElementById('aboutContent');
    content.classList.toggle('show');
    
    if (soundEnabled) {
      const infoSound = document.getElementById('infoSound');
      infoSound.currentTime = 0;
      infoSound.volume = 0.3;
      infoSound.play().catch(e => console.log("Info sound failed:", e));
    }
  });

  // Shop toggle
  document.getElementById('shopToggle').addEventListener('click', function() {
    this.classList.toggle('active');
    const content = document.getElementById('shopContent');
    content.classList.toggle('show');
    
    if (soundEnabled) {
      const toggleSound = document.getElementById('toggleSound');
      toggleSound.currentTime = 0;
      toggleSound.volume = 0.3;
      toggleSound.play().catch(e => console.log("Toggle sound failed:", e));
    }
  });

  // Close both sections by default
  document.getElementById('leaderboardContainer').classList.remove('show');
  document.getElementById('aboutContent').classList.remove('show');
  document.getElementById('shopContent').classList.remove('show');
}

// Initialize Settings
function initSettings() {
  // Sound settings
  const savedSound = localStorage.getItem('soundEnabled');
  if (savedSound !== null) {
    soundEnabled = savedSound === 'true';
    document.getElementById('soundToggle').textContent = 
      `ශබ්දය: ${soundEnabled ? 'සක්‍රීය' : 'අක්‍රීය'}`;
  }

  // Dark mode
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    darkMode = true;
    document.body.setAttribute('data-theme', 'dark');
    document.getElementById('darkModeToggle').textContent = 'සාමාන්‍ය ප්‍රකාරය';
  }

  // Card size
  const savedCardSize = localStorage.getItem('cardSize');
  if (savedCardSize) {
    cardSize = parseInt(savedCardSize);
    document.getElementById('cardSize').value = cardSize;
  }
  
  // Easy rounds completed
  easyRoundsCompleted = parseInt(localStorage.getItem('easyRounds') || '0');
  
  // Load classic best time
  const savedBestTime = localStorage.getItem('classicBestTime');
  if (savedBestTime) {
    classicBestTime = parseInt(savedBestTime);
  }
  
  // Load coins
  const savedCoins = localStorage.getItem('playerCoins');
  if (savedCoins) playerCoins = parseInt(savedCoins);
  
  // Load unlocked themes
  const savedThemes = localStorage.getItem('unlockedThemes');
  if (savedThemes) unlockedThemes = JSON.parse(savedThemes);
}

// Preload Audio
function preloadAudio() {
  [matchSound, mismatchSound, winSound, flipSound, toggleSound, infoSound, timeUpSound].forEach(sound => {
    if (sound.readyState === 4) return;
    sound.load().catch(e => console.log("Audio preload failed:", e));
  });
}

// On Page Load
window.onload = () => {
  const splash = document.getElementById('splash');
  const loadingBar = document.querySelector('.loading-bar');
  const loadingPercentage = document.querySelector('.loading-percentage');
  
  // Simulate loading progress
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > 100) progress = 100;
    
    loadingBar.style.width = `${progress}%`;
    loadingPercentage.textContent = `${Math.floor(progress)}%`;
    
    // Change loading messages based on progress
    const messages = [
      "පද්ධතිය පූරණය වෙමින්...",
      "කාඩ්පත් සූදානම් කරමින්...",
      "තේමා පටිගත කරමින්...",
      "ස්කෝර් ලබා ගැනීම...",
      "සූදානම් වෙමින්..."
    ];
    
    if (progress < 30) {
      document.querySelector('.loading-message').textContent = messages[0];
    } else if (progress < 50) {
      document.querySelector('.loading-message').textContent = messages[1];
    } else if (progress < 70) {
      document.querySelector('.loading-message').textContent = messages[2];
    } else if (progress < 90) {
      document.querySelector('.loading-message').textContent = messages[3];
    } else {
      document.querySelector('.loading-message').textContent = messages[4];
    }
    
    if (progress >= 100) {
      clearInterval(loadingInterval);
      splash.classList.add('fade-out');
      
      setTimeout(() => {
        splash.remove();
        initGame();
      }, 500);
    }
  }, 200);
};

function initGame() {
  initSettings();
  initToggles();
  initLevelSystem();
  initDailyChallenge();
  renderLeaderboard();
  
  // Initialize theme selection before creating board
  updateThemeSelect();
  
  createBoard("medium");
  checkUsername();
  renderUsernameInHeader();
  preloadAudio();
  checkClassicUnlock();
  makeAssistantDraggable();
  updateCoinDisplay();
  
  // Add event listener for level select change
  document.getElementById('levelSelect').addEventListener('change', function() {
    updateBestTimeDisplay();
  });
  
  // Add buy button functionality
  document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', function() {
      if (this.disabled) return;
      
      const themeItem = this.closest('.theme-item');
      const theme = themeItem.dataset.theme;
      const price = parseInt(themeItem.dataset.price);
      
      handleShopPurchase(theme, price);
    });
  });
}
