// Game Constants
const themes = {
  sinhala: ['අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'එ', 'ඔ', 'ක', 'ග', 'ච', 'ජ', 'ට', 'ඩ'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
  fruits: ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍉', '🍇', '🍐', '🍑', '🥭', '🍍', '🥥', '🥝', '🍏', '🍈'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
  vehicles: ['🚗', '🚕', '🚙', '🚌', '🚑', '🚒', '🚲', '🏍', '✈️', '🚀', '🛳', '🚁', '🚚', '🚜', '🏎', '🛵'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥊'],
  foods: ['🍔', '🍕', '🌭', '🥪', '🍣', '🍛', '🍜', '🍝', '🍠', '🍦', '🍩', '🍪', '🎂', '🍫', '🍬', '🍭']
};

const themeNames = {
  sinhala: 'සිංහල අක්ෂර',
  numbers: 'අංක',
  fruits: 'පළතුරු',
  animals: 'සතුන්',
  vehicles: 'වාහන',
  sports: 'ක්‍රීඩා',
  foods: 'ආහාර'
};

const CLASSIC_UNLOCK_REQUIREMENT = 10; // Easy rounds needed to unlock classic mode

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
let helperActive = false;
let helperInterval;

// Helper Messages
const helperMessages = {
  unlock: "සුභ පැතුම්! ඔබ පහසු මට්ටම 10 වතාවක් ජයග්‍රහණය කර ඇත. ඔබට දැන් සම්භාව්‍ය මට්ටමට පිවිසිය හැකිය!",
  intro: "මෙය සම්භාව්‍ය මට්ටමයි. කාඩ්පත් කෙටි වේලාවකට පෙන්වනු ලැබේ, පසුව ඒවා ආවරණය කරනු ලැබේ. මම ඔබට උදව් කරමි!",
  timeExtended: "මම ඔබට කාලය දීර්ඝ කළා! (+5 තත්පර)",
  hintOffered: "මෙන්න ඉඟියක්: මෙම කාඩ්පත් දෙක ගැලපිය හැකිය",
  victory: "ප්‍රශංසා! ඔබ සම්භාව්‍ය මට්ටම ජයග්‍රහණය කළා!",
  encouragement: "ඔබට මෙය කළ හැකිය! දිගටම උත්සාහ කරන්න!"
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
    const classicOption = document.createElement('option');
    classicOption.value = 'classic';
    classicOption.textContent = 'සම්භාව්‍ය මට්ටම (4x4)';
    levelSelect.appendChild(classicOption);
  }
}

function provideHelperAssistance() {
  if (!helperActive) return;
  
  const helpType = Math.floor(Math.random() * 4); // 0-3
  
  switch(helpType) {
    case 0: // Extend time
      time += 5;
      timerDisplay.textContent = time;
      showHelperMessage(helperMessages.timeExtended);
      break;
      
    case 1: // Offer hint
      const unflippedCards = Array.from(document.querySelectorAll('.card:not(.flipped)'));
      if (unflippedCards.length > 1) {
        const randomIndex = Math.floor(Math.random() * unflippedCards.length);
        const card = unflippedCards[randomIndex];
        card.classList.add('hint');
        setTimeout(() => card.classList.remove('hint'), 2000);
        showHelperMessage(helperMessages.hintOffered);
      }
      break;
      
    case 2: // General encouragement
      showHelperMessage(helperMessages.encouragement);
      break;
      
    case 3: // Find a potential match
      const unflipped = Array.from(document.querySelectorAll('.card:not(.flipped)'));
      if (unflipped.length >= 2) {
        // Find cards with matching values
        const cardValues = {};
        let matchFound = false;
        
        for (const card of unflipped) {
          const value = card.dataset.value;
          if (cardValues[value]) {
            // Found a match
            cardValues[value].classList.add('hint');
            card.classList.add('hint');
            setTimeout(() => {
              cardValues[value].classList.remove('hint');
              card.classList.remove('hint');
            }, 2000);
            showHelperMessage(helperMessages.hintOffered);
            matchFound = true;
            break;
          }
          cardValues[value] = card;
        }
        
        if (!matchFound) {
          // If no matches found, just highlight two random cards
          const randomIndex1 = Math.floor(Math.random() * unflipped.length);
          let randomIndex2 = Math.floor(Math.random() * unflipped.length);
          while (randomIndex2 === randomIndex1) {
            randomIndex2 = Math.floor(Math.random() * unflipped.length);
          }
          unflipped[randomIndex1].classList.add('hint');
          unflipped[randomIndex2].classList.add('hint');
          setTimeout(() => {
            unflipped[randomIndex1].classList.remove('hint');
            unflipped[randomIndex2].classList.remove('hint');
          }, 2000);
          showHelperMessage(helperMessages.hintOffered);
        }
      }
      break;
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

// Game Functions
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateTimer() {
  time++;
  timerDisplay.textContent = time;
}

function createBoard(level) {
  board.innerHTML = "";
  clearInterval(timer);
  if (helperInterval) clearInterval(helperInterval);
  time = 0;
  attempts = 0;
  matches = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  helperActive = false;
  
  timerDisplay.textContent = "0";
  attemptsDisplay.textContent = "0";
  matchesDisplay.textContent = "0";
  timer = setInterval(updateTimer, 1000);

  currentTheme = document.getElementById("themeSelect").value;
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
    helperActive = true;
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
    
    setTimeout(() => {
      cards.forEach(card => {
        card.textContent = '?';
        card.classList.remove('flipped');
      });
      // Start helper assistance
      helperInterval = setInterval(provideHelperAssistance, 15000);
    }, 5000);
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
      if (helperInterval) clearInterval(helperInterval);
      
      // Track easy rounds for classic unlock
      const level = document.getElementById("levelSelect").value;
      if (level === "easy") {
        easyRoundsCompleted++;
        localStorage.setItem('easyRounds', easyRoundsCompleted);
        checkClassicUnlock();
      }
      
      if (level === "classic") {
        showHelperMessage(helperMessages.victory, 5000);
      }
      
      if (soundEnabled) {
        winSound.currentTime = 0;
        winSound.play();
      }
      showWinMessage();
      saveScore(time, attempts);
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
    level: document.getElementById("levelSelect").value
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
    default: return level;
  }
}

// UI Functions
function showWinMessage() {
  document.getElementById('finalTime').textContent = time;
  document.getElementById('finalAttempts').textContent = attempts;
  document.getElementById('winMessage').classList.add('show');
  
  // Vibrate on win if supported
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

function hideWinMessage() {
  document.getElementById('winMessage').classList.remove('show');
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
  createBoard(level);
  showControls();
  document.getElementById("gameContainer").classList.remove("game-focused");
  hideWinMessage();
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

  // Close both sections by default
  document.getElementById('leaderboardContainer').classList.remove('show');
  document.getElementById('aboutContent').classList.remove('show');
}

// PWA Installation
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  const installBtn = document.createElement('button');
  installBtn.id = 'installBtn';
  installBtn.innerHTML = `
    <img src="icon-72.png" width="24" height="24">
    යෙදුම ස්ථාපනය කරන්න
  `;
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 15px;
    background: #00796b;
    color: white;
    border: none;
    border-radius: 30px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 999;
  `;
  
  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted install');
      }
      deferredPrompt = null;
    });
  });
  
  document.body.appendChild(installBtn);
}

window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  const installBtn = document.getElementById('installBtn');
  if (installBtn) installBtn.remove();
});

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
}

// Preload Audio
function preloadAudio() {
  [matchSound, mismatchSound, winSound, flipSound, toggleSound, infoSound].forEach(sound => {
    if (sound.readyState === 4) return;
    sound.load().catch(e => console.log("Audio preload failed:", e));
  });
}

// Android Back Button Handling
document.addEventListener('backbutton', handleBackButton, false);
function handleBackButton() {
  if (document.getElementById('winMessage').classList.contains('show')) {
    hideWinMessage();
  } else if (document.getElementById('instructionsModal').classList.contains('show')) {
    closeInstructions();
  } else if (document.getElementById('usernameModal').classList.contains('show')) {
    return;
  } else if (window.navigator.app) {
    navigator.app.exitApp();
  }
}

// On Page Load
window.onload = () => {
  // Hide splash screen
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 500);
    }
  }, 2000);
  
  initSettings();
  initToggles();
  renderLeaderboard();
  createBoard("medium");
  checkUsername();
  renderUsernameInHeader();
  preloadAudio();
  checkClassicUnlock();
};// Update the window.onload function
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
  renderLeaderboard();
  createBoard("medium");
  checkUsername();
  renderUsernameInHeader();
  preloadAudio();
  checkClassicUnlock();
}