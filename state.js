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
        console.log('timeGameOver', timeGameOver);
        SCREEN.gameoverScreen.classList.add('active');
        SCREEN.playingScreen.classList.remove('active');
        SCREEN.startScreen.classList.remove('active');
        SCREEN.pausedScreen.classList.remove('active');
        
        if(restartInfo.classList.contains("hidden") && !restartInfo.dataset.timerStarted) {
            restartInfo.dataset.timerStarted = "true";
            setTimeout(function() {
                restartInfo.classList.remove("hidden");
                restartInfo.dataset.timerStarted = "";
            }, 3000);
        }
    }
};

window.addEventListener('keydown', (event) => {
    if(event.target.tagName == 'INPUT') return;
    console.log("닉네임 상태: ", nickname);
    if(state === SCREEN_STATE.START && (nickname !== undefined && nickname !== "")) {
        showScreen(SCREEN_STATE.PLAYING);
        event.stopImmediatePropagation();
        initQueue();
        spawnPiece();
        previewDraw();
        lastDropTime = document.timeline.currentTime;
        aniFrame = requestAnimationFrame(dropTimeUpdate);
        return;
    }
    if(state === SCREEN_STATE.GAMEOVER) {
        if (performance.now() - gameoverEnteredTime >= 3000) {
            console.log("게임오버 화면 진입한 지 몇 초 지남: ", (performance.now() - gameoverEnteredTime));
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
                lastDropTime = document.timeline.currentTime;
            }
            console.log('esc 누름: ', state);
            break;
        }
})


