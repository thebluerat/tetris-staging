const nicknameInput = document.getElementById("nickname_input");
const nicknameButton = document.getElementById("nickname_button");
const startingMsg = document.getElementById("starting_msg");

let nickname = undefined;

function handleInputAction(event) {
    if(event.type === 'keydown' && event.key !== 'Enter') {
        return;
    }
    nickname = nicknameInput.value.trim();
    if(nickname === "") {
        nicknameInput.value = "";
        nicknameInput.placeholder = "닉네임 입력... 안 하셨네요...";
        nicknameInput.addEventListener("focus", function() {
            nicknameInput.placeholder = "닉네임을 입력하세유";
        })
        return;
    }
    console.log('nickname', nickname);
    startingMsg.textContent = nickname + "님.. 아무 키나 누르면 시작합니다...";
}

nicknameButton.addEventListener("click", handleInputAction)
nicknameInput.addEventListener("keydown", handleInputAction)