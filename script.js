// Game Constants
const themes = {
  sinhala: ['අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'ඍ', 'ඎ', 'ඏ', 'ඐ', 'එ', 'ඒ', 'ඓ', 'ඔ'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
  fruits: ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍉', '🍇', '🍑', '🍍', '🥝', '🍅', '🥑', '🥥', '🍆', '🌶️'],
  animals: ['🐘', '🦁', '🐯', '🐼', '🐨', '🦊', '🐻', '🐵', '🐔', '🐸', '🦄', '🐶', '🐱', '🐰', '🐭', '🐹'],
  vehicles: ['🚗', '🚕', '🚌', '🚑', '🚒', '🚓', '🚲', '🛵', '✈️', '🚀', '🚁', '🚂', '🚢', '🚤', '🛶', '🚜'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥎', '🏏', '🪃', '🥏'],
  foods: ['🍕', '🍔', '🌭', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍤', '🍙', '🍚'],
  professions: ['👮‍♂️', '👷‍♀️', '👨‍⚕️', '👩‍🍳', '👨‍🔬', '👩‍🎨', '👨‍🏫', '👩‍💻', '👨‍✈️', '👩‍🚀', '👨‍🔧', '👩‍🏭', '👨‍🎤', '👩‍🎓', '👨‍🌾', '👩‍🚒'],
  flags: ['🇱🇰', '🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇯🇵', '🇰🇷', '🇸🇬', '🇲🇾', '🇶🇦', '🇸🇦', '🇹🇭', '🇿🇦', '🇨🇳', '🇷🇺'],
  music: ['🎹', '🥁', '🎸', '🎷', '🎺', '🎻', '🪕', '🎼', '🎤', '🎧', '📻', '🎶', '🪗', '🪘', '🎵', '🎜'],
  nature: ['🌲', '🌳', '🌴', '🌱', '🌷', '🌸', '🌹', '🍀', '🌻', '🌼', '🌾', '🌿', '🍁', '🍂', '🌵', '🌊']
};

const themeNames = {
  sinhala: 'සිංහල අක්ෂර',
  numbers: 'අංක',
  fruits: 'පලතුරු',
  animals: 'සතුන්',
  vehicles: 'වාහන',
  sports: 'ක්‍රීඩා',
  foods: 'ආහාර',
  professions: 'වෘත්තීන්',
  flags: 'ජාතික ධජ',
  music: 'සංගීත භාණ්ඩ',
  nature: 'ප්‍රකෘතිය'
};

const CLASSIC_UNLOCK_REQUIREMENT = 3; // Changed to 3 for testing
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
const themeSelect = document.getElementById('themeSelect');

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
let playerCoins = 100; // Starting with 100 coins for testing
let dailyChallengeCompleted = false;
let unlockedThemes = ['sinhala', 'numbers', 'fruits', 'animals', 'vehicles', 'sports', 'foods'];
let currentLevel = 1;
let currentPoints = 0;
let requiredPoints = 10;
let assistantPoints = 0;
const maxAssistantPoints = 10; // Reduced for testing
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
  badge.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    background: linear-gradient(45deg, #FF5722, #FF9800);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.8rem;
    z-index: 10;
    animation: pulse 2s infinite;
  `;
  
  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) {
    gameContainer.appendChild(badge);
  }
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
      button.textContent = 'මිලදී ගත්තා';
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
    levelUpSound.play().catch(e => console.log("Level up sound error:", e));
  }
  
  // Show level up message
  showHelperMessage(`අභිනන්දනය! ඔබ මට්ටම ${currentLevel} ට උසස් විය!`, 4000);
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
    showHelperMessage("ඇසිස්ටන්ට් සුදානම්! ක්ලික් කර උදව් ලබාගන්න", 4000);
    
    // Play assistant ready sound
    if (soundEnabled) {
      const assistantSound = document.getElementById('assistantSound');
      assistantSound.currentTime = 0;
      assistantSound.play().catch(e => console.log("Assistant sound error:", e));
    }
  }
}

// Update level display
function updateLevelDisplay() {
  document.querySelector('.level-value').textContent = currentLevel;
  document.querySelector('.points-value').textContent = currentPoints;
  document.querySelector('.points-total').textContent = requiredPoints;
  
  const progressPercent = (currentPoints / requiredPoints) * 100;
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
  }
}

// Update assistant display
function updateAssistantDisplay() {
  const progressPercent = (assistantPoints / maxAssistantPoints) * 100;
  const progressFill = document.querySelector('.assistant-progress .progress-fill');
  
  if (!progressFill) return;
  
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

// Handle shop purchase function
function handleShopPurchase(theme, price) {
  if (playerCoins >= price) {
    // Deduct coins
    playerCoins -= price;
    
    // Add theme to unlocked themes
    if (!unlockedThemes.includes(theme)) {
      unlockedThemes.push(theme);
    }
    
    // Save to localStorage
    localStorage.setItem('playerCoins', playerCoins);
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
    
    // Update displays
    updateCoinDisplay();
    updateThemeSelect();
    
    // Show success message
    showHelperMessage(`සාර්ථකව මිලදී ගත්තා! ${themeNames[theme]} තේමාව`, 3000);
    
    // Play purchase sound
    if (soundEnabled) {
      const purchaseSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cash-register-bell-sale-1107.mp3');
      purchaseSound.volume = 0.5;
      purchaseSound.play().catch(e => console.log("Purchase sound error:", e));
    }
    
  } else {
    showHelperMessage('කාසි ප්‍රමාණවත් නැත!', 3000);
  }
}

// Make assistant draggable
function makeAssistantDraggable() {
  const assistantBtn = document.getElementById('assistantBtn');
  if (!assistantBtn) return;
  
  let isDragging = false;
  let offsetX, offsetY;
  let startX, startY;
  
  // Set initial position
  assistantBtn.style.position = 'fixed';
  assistantBtn.style.bottom = '20px';
  assistantBtn.style.right = '20px';
  assistantBtn.style.zIndex = '500';
  
  assistantBtn.addEventListener('mousedown', startDrag);
  assistantBtn.addEventListener('touchstart', startDragTouch, { passive: false });
  
  function startDrag(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = assistantBtn.offsetLeft;
    offsetY = assistantBtn.offsetTop;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
  }
  
  function startDragTouch(e) {
    isDragging = true;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    offsetX = assistantBtn.offsetLeft;
    offsetY = assistantBtn.offsetTop;
    
    document.addEventListener('touchmove', dragTouch, { passive: false });
    document.addEventListener('touchend', stopDrag);
    e.preventDefault();
  }
  
  function drag(e) {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    const newX = offsetX + dx;
    const newY = offsetY + dy;
    
    // Boundary checking
    const maxX = window.innerWidth - assistantBtn.offsetWidth;
    const maxY = window.innerHeight - assistantBtn.offsetHeight;
    
    assistantBtn.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
    assistantBtn.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    assistantBtn.style.right = 'auto';
    assistantBtn.style.bottom = 'auto';
  }
  
  function dragTouch(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    
    const newX = offsetX + dx;
    const newY = offsetY + dy;
    
    // Boundary checking
    const maxX = window.innerWidth - assistantBtn.offsetWidth;
    const maxY = window.innerHeight - assistantBtn.offsetHeight;
    
    assistantBtn.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
    assistantBtn.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    assistantBtn.style.right = 'auto';
    assistantBtn.style.bottom = 'auto';
  }
  
  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', dragTouch);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
  }
}

// Use assistant function
function useAssistant() {
  if (lockBoard) return;
  
  // Play assistant sound
  if (soundEnabled) {
    const assistantSound = document.getElementById('assistantSound');
    assistantSound.currentTime = 0;
    assistantSound.play().catch(e => console.log("Assistant sound error:", e));
  }
  
  // Find unflipped cards
  const cards = Array.from(document.querySelectorAll('.card:not(.flipped)'));
  
  if (cards.length < 2) {
    showHelperMessage('පෙරළිය හැකි කාඩ්පත් නැත!', 2000);
    return;
  }
  
  // Find a matching pair
  let foundMatch = false;
  const valuesMap = {};
  
  cards.forEach(card => {
    const value = card.dataset.value;
    if (valuesMap[value]) {
      // Found a matching pair
      valuesMap[value].push(card);
      foundMatch = true;
    } else {
      valuesMap[value] = [card];
    }
  });
  
  if (foundMatch) {
    // Highlight first matching pair
    for (const cardList of Object.values(valuesMap)) {
      if (cardList.length >= 2) {
        cardList[0].classList.add('hint');
        cardList[1].classList.add('hint');
        
        setTimeout(() => {
          cardList[0].classList.remove('hint');
          cardList[1].classList.remove('hint');
        }, 2000);
        
        showHelperMessage('ගැලපෙන ජෝඩුවක් සොයාගත්තා!', 3000);
        return;
      }
    }
  } else {
    // Randomly show two cards as hint
    const shuffled = cards.sort(() => Math.random() - 0.5);
    shuffled[0].classList.add('hint');
    shuffled[1].classList.add('hint');
    
    setTimeout(() => {
      shuffled[0].classList.remove('hint');
      shuffled[1].classList.remove('hint');
    }, 2000);
    
    showHelperMessage('උත්සාහ කරන්න!', 3000);
  }
}

// Initialize Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// PWA Installation
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button after a delay
  setTimeout(() => {
    showInstallButton();
  }, 5000);
});

function showInstallButton() {
  // Check if button already exists
  if (document.getElementById('installBtn')) return;
  
  const installBtn = document.createElement('button');
  installBtn.id = 'installBtn';
  installBtn.className = 'install-button';
  installBtn.innerHTML = '📱 App ස්ථාපනය කරන්න';
  installBtn.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    background: linear-gradient(145deg, #00796b, #004c40);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 499;
    font-family: 'Noto Sans Sinhala', sans-serif;
    animation: pulse 2s infinite;
    display: none;
  `;
  
  // Only show on mobile devices
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    installBtn.style.display = 'block';
  }
  
  installBtn.addEventListener('click', installApp);
  document.body.appendChild(installBtn);
}

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        showHelperMessage('යෙදුම ස්ථාපනය කරන ලදී!', 3000);
        // Remove install button
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.remove();
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
}

// Helper Functions
function showHelperMessage(message, duration = 3000) {
  // Remove existing helper messages
  document.querySelectorAll('.helper-message').forEach(msg => msg.remove());
  
  const helperDiv = document.createElement('div');
  helperDiv.className = 'helper-message';
  helperDiv.textContent = message;
  helperDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #00796b;
    color: white;
    padding: 15px 25px;
    border-radius: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    max-width: 90%;
    text-align: center;
    font-family: 'Noto Sans Sinhala', sans-serif;
  `;
  
  document.body.appendChild(helperDiv);
  
  // Show message
  setTimeout(() => {
    helperDiv.style.opacity = '1';
  }, 10);
  
  // Hide message after duration
  setTimeout(() => {
    helperDiv.style.opacity = '0';
    setTimeout(() => {
      if (helperDiv.parentNode) {
        helperDiv.remove();
      }
    }, 500);
  }, duration);
}

function checkClassicUnlock() {
  if (easyRoundsCompleted >= CLASSIC_UNLOCK_REQUIREMENT && !classicUnlocked) {
    classicUnlocked = true;
    showHelperMessage("සම්භාව්‍ය මට්ටම අගුළු හැරිනි! දැන් ඔබට සම්භාව්‍ය මට්ටම ක්‍රීඩා කළ හැකිය.", 5000);
    
    // Add classic level to select dropdown
    const levelSelect = document.getElementById('levelSelect');
    const classicOption = levelSelect.querySelector('option[value="classic"]');
    if (classicOption) {
      classicOption.classList.remove('classic-hidden');
    }
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

// Update best time display
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
  clearTimeout(classicTimeout);
  if (helperInterval) clearInterval(helperInterval);
  
  // Reset game state
  attempts = 0;
  matches = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  timeExtended = false;
  
  // Reset time based on level
  if (level === "classic") {
    time = CLASSIC_TIME_LIMIT;
  } else if (level === "daily") {
    time = 120; // 2 minutes for daily challenge
  } else {
    time = 0;
  }
  
  timerDisplay.textContent = time;
  attemptsDisplay.textContent = "0";
  matchesDisplay.textContent = "0";
  
  // Update best time display
  updateBestTimeDisplay();
  
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
  board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  board.style.gap = '10px';

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
    card.style.display = 'flex';
    card.style.justifyContent = 'center';
    card.style.alignItems = 'center';
    card.style.cursor = 'pointer';

    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });

  // For classic level, show all cards briefly
  if (level === "classic") {
    showHelperMessage("සම්භාව්‍ය මට්ටම: කාඩ්පත් සියල්ල 5 තත්පර තුළ මතක තබාගන්න!", 4000);
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
  } else {
    // Start timer immediately for other levels
    timer = setInterval(updateTimer, 1000);
  }
}

function flipCard() {
  if (lockBoard || this.classList.contains("flipped")) return;

  if (soundEnabled) {
    flipSound.currentTime = 0;
    flipSound.play().catch(e => console.log("Flip sound error:", e));
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
      matchSound.play().catch(e => console.log("Match sound error:", e));
    }
    
    matches++;
    matchesDisplay.textContent = matches;
    
    // Mark as matched
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
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
          showHelperMessage("සුභ පැතුම්! සම්භාව්‍ය මට්ටම ජයග්‍රහණය කළා!", 5000);
        }
      }
      
      if (soundEnabled) {
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log("Win sound error:", e));
      }
      
      afterGameWin(finalTime, attempts);
      showWinMessage(finalTime, attempts);
      saveScore(finalTime, attempts);
    }
    
    resetBoard();
  } else {
    if (soundEnabled) {
      mismatchSound.currentTime = 0;
      mismatchSound.play().catch(e => console.log("Mismatch sound error:", e));
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
    showHelperMessage(`නව හොඳම කාලය! ${classicBestTime} තත්පර`, 4000);
    updateBestTimeDisplay();
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
    
    showHelperMessage("දිනපතා අභියෝගය ජයග්‍රහණය කළා! ඔබට 10 කාසි ලැබුණා!", 5000);
  } else if (level !== "daily") {
    // Earn coins for regular games
    const coinsEarned = Math.max(1, Math.floor(10 - attempts/2));
    playerCoins += coinsEarned;
    localStorage.setItem('playerCoins', playerCoins);
    updateCoinDisplay();
    
    showHelperMessage(`ඔබට ${coinsEarned} කාසි ලැබුණා!`, 3000);
  }
}

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Leaderboard Functions
function saveScore(time, attempts) {
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  const username = localStorage.getItem('username') || 'අනාමික';
  scores.push({ 
    username,
    time, 
    attempts, 
    theme: currentTheme,
    date: new Date().toLocaleDateString('si-LK'),
    level: document.getElementById('levelSelect').value
  });
  
  // Sort by time (ascending) then attempts (ascending)
  scores.sort((a, b) => {
    if (a.time === b.time) {
      return a.attempts - b.attempts;
    }
    return a.time - b.time;
  });
  
  // Keep only top 10 scores
  localStorage.setItem("scores", JSON.stringify(scores.slice(0, 10)));
  renderLeaderboard();
}

function renderLeaderboard() {
  leaderboard.innerHTML = "";
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  
  if (scores.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "තවම ලකුණු නැත. පළමු තරඟය ජයග්‍රහණය කරන්න!";
    leaderboard.appendChild(emptyItem);
    return;
  }
  
  scores.forEach((score, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span class="rank">${index + 1}.</span>
      <span class="username">${score.username}</span>
      <span class="time">${score.time}s</span>
      <span class="attempts">${score.attempts} පි.</span>
      <span class="theme">${themeNames[score.theme] || score.theme}</span>
    `;
    leaderboard.appendChild(item);
  });
}

// UI Functions
function showWinMessage(finalTime, attempts) {
  document.getElementById('finalTime').textContent = finalTime;
  document.getElementById('finalAttempts').textContent = attempts;
  document.getElementById('winMessage').classList.remove('hidden');
  document.getElementById('winMessage').classList.add('show');
}

function hideWinMessage() {
  document.getElementById('winMessage').classList.remove('show');
  document.getElementById('winMessage').classList.add('hidden');
}

function showTimeUpMessage() {
  document.getElementById('timeUpMatches').textContent = matches;
  document.getElementById('timeUpTotalPairs').textContent = totalPairs;
  document.getElementById('timeUpAttempts').textContent = attempts;
  
  document.getElementById('timeUpMessage').classList.remove('hidden');
  document.getElementById('timeUpMessage').classList.add('show');
  
  // Play time up sound
  if (soundEnabled) {
    const timeUpSound = document.getElementById('timeUpSound');
    timeUpSound.currentTime = 0;
    timeUpSound.play().catch(e => console.log("Time up sound error:", e));
  }
}

function hideTimeUpMessage() {
  document.getElementById('timeUpMessage').classList.remove('show');
  document.getElementById('timeUpMessage').classList.add('hidden');
}

function showInstructions() {
  document.getElementById('instructionsModal').classList.add('show');
}

function closeInstructions() {
  document.getElementById('instructionsModal').classList.remove('show');
}

function startGame() {
  const level = document.getElementById("levelSelect").value;
  const theme = themeSelect.value;
  
  if (!theme) {
    showHelperMessage("කරුණාකර තේමාවක් තෝරන්න!", 3000);
    return;
  }
  
  createBoard(level);
  
  // Hide controls and focus on game
  document.querySelector(".controls").style.display = "none";
  document.getElementById("gameContainer").scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center'
  });
}

function restartGame() {
  const level = document.getElementById("levelSelect").value;
  hideWinMessage();
  hideTimeUpMessage();
  createBoard(level);
  
  // Show controls again
  document.querySelector(".controls").style.display = "block";
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
    showHelperMessage("කරුණාකර වලංගු පරිශීලක නාමයක් ඇතුළත් කරන්න (උපරිම අකුරු 20)", 3000);
  }
}

function renderUsernameInHeader() {
  const username = localStorage.getItem('username');
  if (username) {
    let usernameDisplay = document.querySelector('.username-display');
    if (!usernameDisplay) {
      usernameDisplay = document.createElement('div');
      usernameDisplay.className = 'username-display';
      const header = document.querySelector('.header');
      header.insertBefore(usernameDisplay, header.firstChild);
    }
    usernameDisplay.textContent = `පරිශීලක: ${username}`;
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
      if (toggleSound) {
        toggleSound.currentTime = 0;
        toggleSound.volume = 0.3;
        toggleSound.play().catch(e => console.log("Toggle sound error:", e));
      }
    }
  });

  // About page toggle
  document.getElementById('aboutToggle').addEventListener('click', function() {
    this.classList.toggle('active');
    const content = document.getElementById('aboutContent');
    content.classList.toggle('show');
    
    if (soundEnabled) {
      const infoSound = document.getElementById('infoSound');
      if (infoSound) {
        infoSound.currentTime = 0;
        infoSound.volume = 0.3;
        infoSound.play().catch(e => console.log("Info sound error:", e));
      }
    }
  });

  // Shop toggle
  document.getElementById('shopToggle').addEventListener('click', function() {
    this.classList.toggle('active');
    const content = document.getElementById('shopContent');
    content.classList.toggle('show');
    
    if (soundEnabled) {
      const toggleSound = document.getElementById('toggleSound');
      if (toggleSound) {
        toggleSound.currentTime = 0;
        toggleSound.volume = 0.3;
        toggleSound.play().catch(e => console.log("Toggle sound error:", e));
      }
    }
  });

  // Close sections by default
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
  if (savedBestTime && savedBestTime !== "Infinity") {
    classicBestTime = parseInt(savedBestTime);
  }
  
  // Load coins
  const savedCoins = localStorage.getItem('playerCoins');
  if (savedCoins) playerCoins = parseInt(savedCoins);
  
  // Load unlocked themes
  const savedThemes = localStorage.getItem('unlockedThemes');
  if (savedThemes) {
    try {
      unlockedThemes = JSON.parse(savedThemes);
    } catch (e) {
      console.log("Error parsing unlocked themes:", e);
    }
  }
}

// On Page Load
window.onload = () => {
  const splash = document.getElementById('splash');
  const loadingBar = document.querySelector('.loading-bar');
  const loadingPercentage = document.querySelector('.loading-percentage');
  
  // Simulate loading progress
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) progress = 100;
    
    if (loadingBar) loadingBar.style.width = `${progress}%`;
    if (loadingPercentage) loadingPercentage.textContent = `${Math.floor(progress)}%`;
    
    // Change loading messages based on progress
    const messages = [
      "දත්ත සම්පත් පූරණය වෙමින්...",
      "ක්‍රීඩා මෘදුකාංග සකස් කරමින්...",
      "ශබ්ද ගොනු සූදානම් කරමින්...",
      "පරිශීලක අතුරුමුහුණත සකස් කරමින්...",
      "ක්‍රීඩාව සූදානම් කරමින්..."
    ];
    
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
      if (progress < 30) {
        loadingMessage.textContent = messages[0];
      } else if (progress < 50) {
        loadingMessage.textContent = messages[1];
      } else if (progress < 70) {
        loadingMessage.textContent = messages[2];
      } else if (progress < 90) {
        loadingMessage.textContent = messages[3];
      } else {
        loadingMessage.textContent = messages[4];
      }
    }
    
    if (progress >= 100) {
      clearInterval(loadingInterval);
      if (splash) {
        splash.classList.add('fade-out');
        
        setTimeout(() => {
          splash.style.display = 'none';
          initGame();
        }, 500);
      } else {
        initGame();
      }
    }
  }, 200);
};

function initGame() {
  initSettings();
  initToggles();
  initLevelSystem();
  initDailyChallenge();
  renderLeaderboard();
  
  // Initialize theme selection
  updateThemeSelect();
  
  // Set default theme
  if (!themeSelect.value && unlockedThemes.length > 0) {
    themeSelect.value = unlockedThemes[0];
    currentTheme = unlockedThemes[0];
  }
  
  // Create initial game board
  createBoard("medium");
  
  // Check username
  checkUsername();
  renderUsernameInHeader();
  
  // Setup assistant button
  makeAssistantDraggable();
  
  // Add event listener for assistant button
  document.getElementById('assistantBtn').addEventListener('click', function() {
    if (assistantPoints >= maxAssistantPoints) {
      useAssistant();
      assistantPoints = 0;
      updateAssistantDisplay();
      saveAssistantProgress();
    } else {
      showHelperMessage(`ඇසිස්ටන්ට් සුදානම් කරන්න! ${maxAssistantPoints - assistantPoints} ලකුණු තව අවශ්‍යයි`, 3000);
    }
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
  
  // Check classic unlock
  checkClassicUnlock();
  
  // Update coin display
  updateCoinDisplay();
  
  // Update assistant display
  updateAssistantDisplay();
  
  // Add event listener for level select change
  document.getElementById('levelSelect').addEventListener('change', function() {
    updateBestTimeDisplay();
  });
  
  // Add event listener for theme select change
  document.getElementById('themeSelect').addEventListener('change', function() {
    currentTheme = this.value;
  });
  
  console.log("Game initialized successfully!");
}
