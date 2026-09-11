const nicknameInput = document.getElementById("nickname_input");
const nicknameButton = document.getElementById("nickname_button");
const startingMsg = document.getElementById("starting_msg");
let nickname = undefined;

const topCountTen = 10;
const rankingList = document.getElementById('ranking_list');
const rankingToggle = document.getElementById('ranking_toggle');
const myRecord = document.getElementById('my_record');
let rankingExpanded = false;

//// 닉네임
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
    nicknameInput.blur();
    startingMsg.textContent = nickname + "님.. 아무 키나 누르면 시작합니다...";
}

nicknameButton.addEventListener("click", handleInputAction);
nicknameInput.addEventListener("keydown", handleInputAction);

//// 랭킹
function getRanking() {
    const ranking = localStorage.getItem('tetrisRanking');
    return ranking ? JSON.parse(ranking) : [];
}
// 이번 판 닉네임, 점수, 이번 판인지 여부 localStorage에 저장하고 점수 순으로 정렬 (게임 오버 시점에 한 번만 부름)
function saveScore(nickname, score, thisRun, totalPlayTime) {
    const ranking = getRanking().map(row => ({...row, thisRun: false}));
    ranking.push({nickname, score, thisRun, totalPlayTime});
    ranking.sort((a, b) => b.score - a.score);
    localStorage.setItem('tetrisRanking', JSON.stringify(ranking));
    return ranking;
};

function renderRanking(allRows) {
    const rankingList = document.getElementById('ranking_list');
	const rows = rankingExpanded ? allRows : allRows.slice(0, topCountTen);
	rankingList.innerHTML = '';
	rows.forEach((row, idx) => {
		const div = document.createElement('div');
		div.className = 'ranking_row ' + (idx % 2 === 0 ? 'even' : 'odd') + (row.thisRun ? ' is_me' : '');
		div.innerHTML = `
			<span class="rank">${String(idx + 1).padStart(2, '0')}</span>
			<span class="nickname">${row.nickname}</span>
			<span class="score">${row.score.toLocaleString()}</span>
            <span class="time">${MStoMMSS(row.totalPlayTime)}</span>
		`;
		rankingList.appendChild(div);
	});
	rankingToggle.classList.toggle('hidden', allRows.length <= topCountTen);
	rankingToggle.textContent = rankingExpanded ? '▲ SHOW LESS' : '···';

	// 내 기록이 Top 10 밖이면 별도 표시
	const myIndex = allRows.findIndex(row => row.thisRun);
	const myRank = myIndex + 1;
	if (myIndex !== -1 && myRank > topCountTen) {
		myRecord.textContent = `Finished ${myRank}th with ${allRows[myIndex].score.toLocaleString()} pts!`;
		myRecord.classList.remove('hidden');
	} else {
		myRecord.classList.add('hidden');
	}
}

rankingToggle.addEventListener('click', function() {
	rankingExpanded = !rankingExpanded;
    renderRanking(getRanking());
	rankingList.classList.toggle('expanded', rankingExpanded);
});