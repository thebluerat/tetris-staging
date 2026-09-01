const SCREEN_STATE = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
}

let state = SCREEN_STATE.START;

const SCREEN = {
    startScreen: document.getElementById('start_screen'),
    playingScreen: document.getElementById('playing_screen'),
    pausedScreen: document.getElementById('paused_screen'),
    gameoverScreen: document.getElementById('gameover_screen'),
}

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
        SCREEN.gameoverScreen.classList.add('active');
        SCREEN.playingScreen.classList.remove('active');
        SCREEN.startScreen.classList.remove('active');
        SCREEN.pausedScreen.classList.remove('active');
    }
};

window.addEventListener('keydown', (event) => {
    if(state === SCREEN_STATE.START) {
        showScreen(SCREEN_STATE.PLAYING);
        lastDropTime = document.timeline.currentTime;
        requestAnimationFrame(dropTimeUpdate);
    }
    switch (event.code) {
        case "Escape":
            if(state === SCREEN_STATE.PLAYING) {
                showScreen(SCREEN_STATE.PAUSED);
            } else if (state === SCREEN_STATE.PAUSED) {
                showScreen(SCREEN_STATE.PLAYING);
            }
            console.log('esc 누름: ', state);
        break;
    }
})


