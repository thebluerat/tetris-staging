const nicknameInput = document.getElementById("nickname_input");
const nicknameButton = document.getElementById("nickname_button");
const startingMsg = document.getElementById("starting_msg");
let nickname = undefined;

const TOP_COUNT = 10;
const rankingList = document.getElementById('ranking_list');
const rankingToggle = document.getElementById('ranking_toggle');
const myRecord = document.getElementById('my_record');
let rankingExpanded = false;

// 닉네임
window.onload = function() {
    if (!nickname) nicknameInput.focus();
}

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
    nicknameInput.blur();
    startingMsg.textContent = nickname + "님.. 아무 키나 누르면 시작합니다...";
}

nicknameButton.addEventListener("click", handleInputAction);
nicknameInput.addEventListener("keydown", handleInputAction);

//랭킹
function renderRanking(allRows) {
	const rows = rankingExpanded ? allRows : allRows.slice(0, TOP_COUNT);
	rankingList.innerHTML = '';
	rows.forEach((row, idx) => {
		const div = document.createElement('div');
		div.className = 'ranking_row ' + (idx % 2 === 0 ? 'even' : 'odd') + (row.justPlayed ? ' is_me' : '');
		div.innerHTML = `
			<span class="rank">${String(idx + 1).padStart(2, '0')}</span>
			<span class="name">${row.nickname}</span>
			<span class="score">${row.score.toLocaleString()}</span>
		`;
		rankingList.appendChild(div);
	});
	rankingToggle.classList.toggle('hidden', allRows.length <= TOP_COUNT);
	rankingToggle.textContent = rankingExpanded ? '▲ SHOW LESS' : '···';

	// 내 기록이 Top 10 밖이면 별도 표시
	const myIndex = allRows.findIndex(row => row.justPlayed);
	const myRank = myIndex + 1;
	if (myIndex !== -1 && myRank > TOP_COUNT) {
		myRecord.textContent = `나의 기록: ${myRank}위 — ${allRows[myIndex].score.toLocaleString()}점`;
		myRecord.classList.remove('hidden');
	} else {
		myRecord.classList.add('hidden');
	}
}

rankingToggle.addEventListener('click', function() {
	rankingExpanded = !rankingExpanded;
	rankingList.classList.toggle('expanded', rankingExpanded);
});