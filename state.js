const SCREEN_STATE = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
}

let state = SCREEN_STATE.START;
let timeGameOver = 0;

const SCREEN = {
    startScreen: document.getElementById('start_screen'),
    playingScreen: document.getElementById('playing_screen'),
    pausedScreen: document.getElementById('paused_screen'),
    gameoverScreen: document.getElementById('gameover_screen'),
}
const restartInfo = document.getElementById('restart');

const waitingTimeToRestart = 3000;

// 화면 전환
function showScreen(newState) {
    state = newState;

    if (newState === SCREEN_STATE.START) {
        SCREEN.startScreen.classList.add('active');
        SCREEN.playingScreen.classList.remove('active');
        SCREEN.pausedScreen.classList.remove('active');
        SCREEN.gameoverScreen.classList.remove('active');
    } else if (newState === SCREEN_STATE.PLAYING) {
        SCREEN.playingScreen.classList.add('active');
        SCREEN.startScreen.classList.remove('active');
        SCREEN.pausedScreen.classList.remove('active');
        SCREEN.gameoverScreen.classList.remove('active');
    } else if (newState === SCREEN_STATE.PAUSED) {
        SCREEN.pausedScreen.classList.add('active');
        SCREEN.startScreen.classList.remove('active');
        SCREEN.gameoverScreen.classList.remove('active');
        SCREEN.playingScreen.classList.remove('active');
    } else if (newState === SCREEN_STATE.GAMEOVER) {
        timeGameOver = document.timeline.currentTime;
        SCREEN.gameoverScreen.classList.add('active');
        SCREEN.playingScreen.classList.remove('active');
        SCREEN.startScreen.classList.remove('active');
        SCREEN.pausedScreen.classList.remove('active');
        
        if(restartInfo.classList.contains("hidden") && !restartInfo.dataset.timerStarted) {
            restartInfo.dataset.timerStarted = "true";
            setTimeout(function() {
                restartInfo.classList.remove("hidden");
                restartInfo.dataset.timerStarted = "";
            }, waitingTimeToRestart);
        }
    }
};

window.addEventListener('keydown', (event) => {
    if(event.target.tagName == 'INPUT') return;
    if(state === SCREEN_STATE.START && (nickname !== undefined && nickname !== "")) {
        showScreen(SCREEN_STATE.PLAYING);
        event.stopImmediatePropagation();
        initQueue();
        spawnPiece();
        previewDraw();
        timePreviousFrame = document.timeline.currentTime;
        aniFrame = requestAnimationFrame(dropTimeUpdate);
        return;
    }
    if(state === SCREEN_STATE.GAMEOVER) {
        if (performance.now() - gameoverEnteredTime >= waitingTimeToRestart) {
            if(event.code == "Space") {
                restartInfo.classList.add("hidden");
                restartInfo.dataset.timerStarted = "";
                resetGame();
                showScreen(SCREEN_STATE.START);
                event.preventDefault();
                nicknameInput.focus();
            }
        }
    }
    switch (event.code) {
        case "Escape":
            if(state === SCREEN_STATE.PLAYING) {
                showScreen(SCREEN_STATE.PAUSED);
            } else if (state === SCREEN_STATE.PAUSED) {
                showScreen(SCREEN_STATE.PLAYING);
                timePreviousFrame = document.timeline.currentTime;
            }
            break;
        }
})


