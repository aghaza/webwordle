let currentPlayer = null;
let secretWord = '';
let currentGuess = '';
let currentAttempt = 0;
let maxAttempts = 6;
let gameOver = false;
let playerWords = [];

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const wordInput = document.getElementById('word-input');

function normalizeText(text) {
    return text.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function login() {
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const messageEl = document.getElementById('login-message');

    if (!username || !password) {
        messageEl.textContent = 'Por favor ingresá nombre y contraseña';
        messageEl.className = 'message error';
        return;
    }

    const players = JSON.parse(localStorage.getItem('wordlePlayers') || '{}');
    
    if (players[username]) {
        if (players[username].password === password) {
            currentPlayer = players[username];
            currentPlayer.username = username;
            startGame();
        } else {
            messageEl.textContent = 'Contraseña incorrecta';
            messageEl.className = 'message error';
        }
    } else {
        const newPlayer = {
            username: username,
            password: password,
            correct: [],
            wrong: [],
            level: 0,
            words: [...WORDS]
        };
        players[username] = newPlayer;
        localStorage.setItem('wordlePlayers', JSON.stringify(players));
        currentPlayer = newPlayer;
        messageEl.textContent = 'Jugador creado exitosamente';
        messageEl.className = 'message success';
        setTimeout(startGame, 1000);
    }
}

function logout() {
    savePlayer();
    currentPlayer = null;
    loginScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-message').textContent = '';
}

function savePlayer() {
    if (!currentPlayer) return;
    const players = JSON.parse(localStorage.getItem('wordlePlayers') || '{}');
    players[currentPlayer.username] = {
        password: currentPlayer.password,
        correct: [...currentPlayer.correct],
        wrong: [...currentPlayer.wrong],
        level: currentPlayer.level,
        words: [...currentPlayer.words]
    };
    localStorage.setItem('wordlePlayers', JSON.stringify(players));
}

function calculateLevel() {
    const totalCorrect = currentPlayer.correct.length;
    const totalWrong = currentPlayer.wrong.length;
    const totalRemaining = currentPlayer.words.length;

    if (totalRemaining === 0 && totalWrong === 0) {
        return 4;
    }

    const totalPlayed = totalCorrect + totalWrong;
    if (totalPlayed === 0) return 0;

    const percentage = (totalCorrect / totalPlayed) * 100;

    if (percentage >= 80) return 4;
    if (percentage >= 60) return 3;
    if (percentage >= 40) return 2;
    if (percentage >= 20) return 1;
    return 0;
}

function startGame() {
    loginScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    currentPlayer.level = calculateLevel();
    maxAttempts = Math.max(1, 6 - currentPlayer.level);

    document.getElementById('player-name').textContent = currentPlayer.username;
    document.getElementById('player-level').textContent = `Nivel ${currentPlayer.level}`;
    document.getElementById('correct-count').textContent = currentPlayer.correct.length;
    document.getElementById('wrong-count').textContent = currentPlayer.wrong.length;
    document.getElementById('remaining-count').textContent = currentPlayer.words.length;

    playerWords = [...currentPlayer.words];

    startNewRound();
}

function startNewRound() {
    if (playerWords.length === 0) {
        playerWords = [...WORDS];
        currentPlayer.words = [...WORDS];
        savePlayer();
    }

    secretWord = playerWords[Math.floor(Math.random() * playerWords.length)];
    playerWords = playerWords.filter(w => w !== secretWord);
    currentPlayer.words = playerWords;

    currentAttempt = 0;
    gameOver = false;

    document.getElementById('attempts-left').textContent = maxAttempts;
    document.getElementById('game-board').innerHTML = '';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'game-message';
    document.getElementById('play-again').classList.add('hidden');
    document.getElementById('word-input').value = '';
    document.getElementById('word-input').disabled = false;
    document.getElementById('submit-btn').disabled = false;

    wordInput.focus();
}

function submitGuess() {
    if (gameOver) return;

    const guess = document.getElementById('word-input').value.toLowerCase().trim();

    if (guess.length !== 5) {
        showMessage('La palabra debe tener 5 letras', 'error');
        return;
    }

    const normalizedGuess = normalizeText(guess);
    const normalizedSecret = normalizeText(secretWord);
    const allWordsNormalized = WORDS.map(w => normalizeText(w));
    
    if (!allWordsNormalized.includes(normalizedGuess) && normalizedGuess !== normalizedSecret) {
        showMessage('Palabra no válida', 'error');
        return;
    }

    currentAttempt++;
    displayGuess(guess);

    if (normalizedGuess === normalizedSecret) {
        winGame();
    } else if (currentAttempt >= maxAttempts) {
        loseGame();
    } else {
        document.getElementById('word-input').value = '';
        document.getElementById('attempts-left').textContent = maxAttempts - currentAttempt;
    }
}

function displayGuess(guess) {
    const row = document.createElement('div');
    row.className = 'guess-row';

    const secretNorm = normalizeText(secretWord).split('');
    const guessNorm = normalizeText(guess).split('');
    const guessArray = guess.split('');
    const result = Array(5).fill('absent');
    const secretUsed = Array(5).fill(false);
    const guessUsed = Array(5).fill(false);

    for (let i = 0; i < 5; i++) {
        if (guessNorm[i] === secretNorm[i]) {
            result[i] = 'correct';
            secretUsed[i] = true;
            guessUsed[i] = true;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (result[i] === 'correct') continue;
        
        for (let j = 0; j < 5; j++) {
            if (!secretUsed[j] && !guessUsed[i] && guessNorm[i] === secretNorm[j]) {
                result[i] = 'present';
                secretUsed[j] = true;
                guessUsed[i] = true;
                break;
            }
        }
    }

    for (let i = 0; i < 5; i++) {
        const box = document.createElement('div');
        box.className = `letter-box ${result[i]}`;
        box.textContent = guessArray[i];
        row.appendChild(box);
    }

    document.getElementById('game-board').appendChild(row);
}

function winGame() {
    gameOver = true;
    currentPlayer.correct.push(secretWord);
    currentPlayer.level = calculateLevel();
    savePlayer();

    showMessage('🎊 ¡¡¡FELICITACIONES!!! 🎊', 'win');
    document.getElementById('word-input').disabled = true;
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('play-again').classList.remove('hidden');

    updateStats();
}

function loseGame() {
    gameOver = true;
    currentPlayer.wrong.push(secretWord);
    currentPlayer.level = calculateLevel();
    savePlayer();

    showMessage(`🔥 CAGASTE FUEGO  🔥 · La palabra era: ${secretWord.toUpperCase()}`, 'lose');
    document.getElementById('word-input').disabled = true;
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('play-again').classList.remove('hidden');

    updateStats();
}

function updateStats() {
    document.getElementById('player-level').textContent = `Nivel ${currentPlayer.level}`;
    document.getElementById('correct-count').textContent = currentPlayer.correct.length;
    document.getElementById('wrong-count').textContent = currentPlayer.wrong.length;
    document.getElementById('remaining-count').textContent = currentPlayer.words.length;
    maxAttempts = Math.max(1, 6 - currentPlayer.level);
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `game-message ${type}`;
}

document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});

document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});

document.getElementById('word-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') submitGuess();
});

document.getElementById('word-input').addEventListener('input', function(e) {
    e.target.value = e.target.value.toLowerCase();
});
