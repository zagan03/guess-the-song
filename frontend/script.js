const API_URL = "http://127.0.0.1:8000";

let allChoices = [];
let currentSongId = null;
let selectedGuessId = null;
let currentCategory = null;

let score = 0;
let maxAllowedSeconds = 3;
let currentRoundPoints = 100;
let roundWon = false;
let guessedScore = 0;
let missedScore = 0;
const guessedEl = document.getElementById('score-guessed')
const missedEl = document.getElementById('score-missed')

const audioPlayer = document.getElementById("audio-player");
const playBtn = document.getElementById("play-btn");
const progressBar = document.getElementById("progress-bar");
const searchInput = document.getElementById("search-input");
const dropdownList = document.getElementById("dropdown-list");
const feedbackBox = document.getElementById("feedback-box");
const guessBtn = document.getElementById("guess-btn");
const scoreSpan = document.getElementById("score");
const potentialPointsSpan = document.getElementById("potential-points");

const tier1Btn = document.getElementById("tier-1")
const tier3Btn = document.getElementById("tier-3");
const tier5Btn = document.getElementById("tier-5");
const tier10Btn = document.getElementById("tier-10");

// 1. Inițializarea jocului
function startGame() {
    currentCategory = document.getElementById('category-select').value;
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    initGame();
}

async function initGame() {
    try {
        const response = await fetch(`${API_URL}/songs-choices?category=${currentCategory}`);
        allChoices = await response.json();
        await loadNewSong();
    } catch (error) {
        showFeedback(false, "Nu mă pot conecta la serverul FastAPI! Verifică dacă Uvicorn rulează.");
    }
}

// 2. Încărcăm o melodie nouă și resetăm pragurile la 3 secunde (100 pct)
async function loadNewSong() {
    if (!roundWon && currentSongId !== null) {
        missedScore++;
        missedEl.textContent = missedScore;
    }
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    progressBar.style.width = "0%";

    selectedGuessId = null;
    roundWon = false;
    searchInput.value = "";
    feedbackBox.className = "feedback";
    feedbackBox.innerHTML = "";
    guessBtn.disabled = false;
    dropdownList.style.display = "none";

    // Resetăm pragul de timp la 1 secunde și miza la 250 puncte
    maxAllowedSeconds = 1;
    currentRoundPoints = 250;
    potentialPointsSpan.textContent = currentRoundPoints;
    updatePlayButtonText();

    tier1Btn.className = "tier-btn active"
    tier1Btn.disabled = true;
    tier3Btn.className = "tier-btn";
    tier3Btn.disabled = false;
    tier5Btn.className = "tier-btn";
    tier5Btn.disabled = false;
    tier10Btn.className = "tier-btn";
    tier10Btn.disabled = false;

    try {
        const response = await fetch(`${API_URL}/random-song?category=${currentCategory}`);
        const data = await response.json();
        currentSongId = data.id;
        audioPlayer.src = "http://localhost:8000" + data.preview;
        audioPlayer.load();
    } catch (error) {
        showFeedback(false, "Eroare la încărcarea melodiei!");
    }
}

// 3. Controlul redării (Play / Stop la limita de secunde)
function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
        playBtn.innerHTML = `⏹️ Oprește`;
    } else {
        stopAudio();
    }
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    updatePlayButtonText();
}

function updatePlayButtonText() {
    playBtn.innerHTML = `▶️ Ascultă (${maxAllowedSeconds}s)`;
}

// Verificăm constant unde a ajuns melodia și o oprim la limita de secunde
audioPlayer.addEventListener("timeupdate", () => {
    const current = audioPlayer.currentTime;
    const percentage = Math.min((current / maxAllowedSeconds) * 100, 100);
    progressBar.style.width = `${percentage}%`;

    if (current >= maxAllowedSeconds) {
        stopAudio();
        progressBar.style.width = "100%";
    }
});

// 4. Deblocarea pragurilor de 5s și 10s
function unlockTier(seconds, newPoints) {
    if (roundWon) return;

    stopAudio();
    maxAllowedSeconds = seconds;
    currentRoundPoints = newPoints;
    potentialPointsSpan.textContent = currentRoundPoints;
    progressBar.style.width = "0%";
    updatePlayButtonText();

    tier1Btn.classList.remove("active");
    tier3Btn.classList.remove("active");
    tier5Btn.classList.remove("active");
    tier10Btn.classList.remove("active");

    if (seconds === 3) {
        tier3Btn.classList.add("active");
        tier1Btn.disabled = true;
        tier3Btn.disabled = true;
    }
    else if (seconds === 5) {
        tier5Btn.classList.add("active");
        tier1Btn.disabled = true;
        tier3Btn.disabled = true;
        tier5Btn.disabled = true;
    } else if (seconds === 10) {
        tier1Btn.disabled = true;
        tier3Btn.disabled = true;
        tier5Btn.disabled = true;
        tier10Btn.disabled = true;
        tier10Btn.classList.add("active");
    }

    // Pornim automat redarea cu noua durată
    togglePlay();
}

// 5. Căutarea în Dropdown
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    selectedGuessId = null;

    const filtered = allChoices.filter(song =>
        song.label.toLowerCase().includes(query)
    );
    renderDropdown(filtered);
});

searchInput.addEventListener("focus", () => {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = allChoices.filter(song =>
        song.label.toLowerCase().includes(query)
    );
    renderDropdown(filtered);
});

function renderDropdown(items) {
    dropdownList.innerHTML = "";
    if (items.length === 0) {
        dropdownList.style.display = "none";
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "dropdown-item";
        div.textContent = item.label;
        div.onclick = () => {
            searchInput.value = item.label;
            selectedGuessId = item.id;
            dropdownList.style.display = "none";
        };
        dropdownList.appendChild(div);
    });

    dropdownList.style.display = "block";
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown-container")) {
        dropdownList.style.display = "none";
    }
});

// 6. Verificarea răspunsului la /check-guess
async function submitGuess() {
    if (!selectedGuessId) {
        const exactMatch = allChoices.find(
            c => c.label.toLowerCase() === searchInput.value.trim().toLowerCase()
        );
        if (exactMatch) {
            selectedGuessId = exactMatch.id;
        }
    }

    if (!selectedGuessId) {
        alert("Alege o melodie din lista care apare când scrii!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/check-guess`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                current_song_id: String(currentSongId),
                guessed_song_id: String(selectedGuessId)
            })
        });

        const result = await response.json();

        if (result.correct) {
            roundWon = true;
            guessBtn.disabled = true;
            tier1Btn.disabled = true;
            tier3Btn.disabled = true;
            tier5Btn.disabled = true;
            tier10Btn.disabled = true;

            score += currentRoundPoints;
            guessedScore += 1;
            guessedEl.textContent = guessedScore;
            scoreSpan.textContent = score;

            // Când ghicește, îi confirmăm numele piesei și îi lăsăm toată melodia liberă (30s)
            const realSong = allChoices.find(c => String(c.id) === String(currentSongId));
            const realSongLabel = realSong ? realSong.label : "";
            maxAllowedSeconds = 30;
            updatePlayButtonText();

            showFeedback(true, `${result.message} (+${currentRoundPoints} pct)`, `🎵 ${realSongLabel}`);
        } else {
            // Dacă greșește, NU îi afișăm răspunsul corect și o lăsăm să mai încerce sau să mărească timpul!
            showFeedback(false, result.message, "Mai ascultă o dată sau deblochează mai multe secunde!");
        }

    } catch (error) {
        showFeedback(false, "Eroare la verificarea răspunsului!");
    }
}

function showFeedback(isCorrect, message, subtext = "") {
    feedbackBox.className = "feedback " + (isCorrect ? "correct" : "wrong");
    feedbackBox.innerHTML = `
        <div>${message}</div>
        ${subtext ? `<div class="reveal-text">${subtext}</div>` : ""}
    `;
}
function giveUp() {
    if (roundWon) return;
    let correct_answer = allChoices.find(curSong => curSong.id == currentSongId);
    let title = correct_answer.label;
    feedbackBox.innerHTML = `
    <div>
    Raspunsul corect era: ${title}
    </div>`
    feedbackBox.style.display = 'block';
    guessBtn.disabled = true;

    missedScore++;
    missedEl.textContent = missedScore;
    roundWon = true;

    stopAudio();
    tier1Btn.disabled=true;
    tier3Btn.disabled=true;
    tier5Btn.disabled=true;
    tier10Btn.disabled=true;
}
