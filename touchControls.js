const pauseButton = document.getElementById('pause_button');
const btnLeft = document.getElementById('btn_left');
const btnRight = document.getElementById('btn_right');
const btnRotateCW = document.getElementById('btn_rotate_cw');
const btnRotateCCW = document.getElementById('btn_rotate_ccw');
const btnSoftDrop = document.getElementById('btn_soft_drop');
const btnHardDrop = document.getElementById('btn_hard_drop');

function bindTap(button, onTap) {
    button.addEventListener('touchstart', (event) => {
        event.preventDefault(); // 더블탭 확대, 클릭 이벤트 중복 발생 방지
        if(state !== 'PLAYING') return;
        onTap();
    });
    button.addEventListener('click', () => {
        if(state !== 'PLAYING') return;
        onTap();
    });
}

bindTap(btnLeft, moveLeft);
bindTap(btnRight, moveRight);
bindTap(btnRotateCW, rotateCW);
bindTap(btnRotateCCW, rotateCCW);
bindTap(btnHardDrop, hardDrop);

// 소프트드롭은 누르고 있는 동안만 적용돼야 해서 start/end를 따로 처리
btnSoftDrop.addEventListener('touchstart', (event) => { event.preventDefault(); startSoftDrop(); });
btnSoftDrop.addEventListener('touchend', (event) => { event.preventDefault(); stopSoftDrop(); });
btnSoftDrop.addEventListener('mousedown', startSoftDrop);
btnSoftDrop.addEventListener('mouseup', stopSoftDrop);

pauseButton.addEventListener('click', togglePause);
pauseButton.addEventListener('touchstart', (event) => { event.preventDefault(); togglePause(); });

restartInfo.addEventListener('touchstart', (event) => {
    event.preventDefault();
    tryRestart();
});
restartInfo.addEventListener('click', tryRestart);

SCREEN.pausedScreen.addEventListener('touchstart', (event) => {
    event.preventDefault();
    togglePause();
});
SCREEN.pausedScreen.addEventListener('click', togglePause);