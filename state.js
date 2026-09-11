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

// 터치 기기 여부를 한 곳에서 판정해서, CSS 미디어쿼리 대신 JS로 직접 텍스트 표시를 결정
// (개발자도구 모바일 흉내 등 환경에 따라 hover/pointer 미디어쿼리 판정이 애매할 수 있어서 더 확실한 방식으로)
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
document.querySelector('.restart_text_keyboard').style.display = isTouchDevice ? 'none' : 'inline';
document.querySelector('.restart_text_touch').style.display = isTouchDevice ? 'inline' : 'none';

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

// START 화면 -> PLAYING 시작 (키보드 "아무 키"와 모바일 탭 둘 다 이 함수를 호출함)
function startGame() {
    showScreen(SCREEN_STATE.PLAYING);
    initQueue();
    spawnPiece();
    previewDraw();
    timePreviousFrame = document.timeline.currentTime;
    aniFrame = requestAnimationFrame(dropTimeUpdate);
}

// 게임오버 화면에서 재시작 (스페이스바 / 탭 공용)
function tryRestart() {
    if (state !== SCREEN_STATE.GAMEOVER) return;
    if (performance.now() - gameoverEnteredTime < waitingTimeToRestart) return;
    restartInfo.classList.add("hidden");
    restartInfo.dataset.timerStarted = "";
    resetGame();
    showScreen(SCREEN_STATE.START);
    // 모바일에서는 자동 포커스 시 키보드가 화면을 덮어버려서 재시작이 안 된 것처럼 보이니, 데스크톱에서만 자동 포커스
    if (!isTouchDevice) nicknameInput.focus();
}

// 일시정지 토글 (ESC 키 / 일시정지 버튼 공용)
function togglePause() {
    if(state === SCREEN_STATE.PLAYING) {
        showScreen(SCREEN_STATE.PAUSED);
    } else if (state === SCREEN_STATE.PAUSED) {
        showScreen(SCREEN_STATE.PLAYING);
        timePreviousFrame = document.timeline.currentTime;
    }
}

window.addEventListener('keydown', (event) => {
    if(event.target.tagName == 'INPUT') return;
    if(state === SCREEN_STATE.START && (nickname !== undefined && nickname !== "")) {
        event.stopImmediatePropagation();
        startGame();
        return;
    }
    if(state === SCREEN_STATE.GAMEOVER) {
        if(event.code == "Space") {
            event.preventDefault();
            tryRestart();
        }
    }
    if(event.code === "Escape") {
        togglePause();
    }
})

// 모바일: 닉네임 입력 후 화면 아무 데나 탭(버튼 포함)하면 시작 (키보드의 "아무 키" 입력과 같은 역할)
// PC는 기존대로 키보드로만 시작하게 두고, 이 탭 시작 기능은 터치 기기에서만 붙임
function tryStartOnTap(event) {
    if (state !== SCREEN_STATE.START) return;
    if (event.target.tagName === 'INPUT') return;
    if (nickname === undefined || nickname === "") return;
    startGame();
}
if (isTouchDevice) {
    document.addEventListener('touchstart', tryStartOnTap);
    document.addEventListener('click', tryStartOnTap);
}