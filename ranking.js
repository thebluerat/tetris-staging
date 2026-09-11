const nicknameInput = document.getElementById("nickname_input");
const nicknameButton = document.getElementById("nickname_button");
const startingMsg = document.getElementById("starting_msg");
let nickname = undefined;

const topCountTen = 10;
const rankingList = document.getElementById('ranking_list');
const rankingToggle = document.getElementById('ranking_toggle');
const myRecord = document.getElementById('my_record');
let rankingExpanded = false;

// DB에 저장 안 할 때
let currentRunRecordId = null;

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
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    startingMsg.textContent = nickname + (isTouchDevice ? "님.. 화면을 탭하면 시작합니다..." : "님.. 아무 키나 누르면 시작합니다...");
}

nicknameButton.addEventListener("click", handleInputAction);
nicknameInput.addEventListener("keydown", handleInputAction);

// 랭킹 조회: DB에서 점수 내림차순으로 전체 가져오기
async function getRanking() {
    const { data, error } = await supabaseClient
        .from('ranking')
        .select('*')
        .order('score', { ascending: false });

    if (error) {
        console.error('랭킹 조회 실패:', error);
        return [];
    }
    return data;
}

// 이번 판 게임 데이터 저장. totalPlayTimeSeconds는 초 단위 정수로 받음
async function saveScore(nickname, score, totalPlayTimeSeconds) {
    const { data, error } = await supabaseClient
        .from('ranking')
        .insert([{ nickname, score, total_play_time_seconds: totalPlayTimeSeconds }])
        .select()
        .single();

    if (error) {
        console.error('데이터 저장 실패:', error);
        return;
    }
    currentRunRecordId = data.id;
}

function renderRanking(allRows) {
    const rankingList = document.getElementById('ranking_list');
    const rows = rankingExpanded ? allRows : allRows.slice(0, topCountTen);
    rankingList.innerHTML = '';
    rows.forEach((row, idx) => {
        const isMe = row.id === currentRunRecordId;
        const div = document.createElement('div');
        div.className = 'ranking_row ' + (idx % 2 === 0 ? 'even' : 'odd') + (isMe ? ' is_me' : '');
        div.innerHTML = `
            <span class="rank">${String(idx + 1).padStart(2, '0')}</span>
            <span class="nickname">${row.nickname}</span>
            <span class="score">${row.score.toLocaleString()}</span>
            <span class="time">${MStoMMSS(row.total_play_time_seconds * 1000)}</span>
        `;
        rankingList.appendChild(div);
    });
    rankingToggle.classList.toggle('hidden', allRows.length <= topCountTen);
    rankingToggle.textContent = rankingExpanded ? '▲ SHOW LESS' : '···';

    const myIndex = allRows.findIndex(row => row.id === currentRunRecordId);
    const myRank = myIndex + 1;
    if (myIndex !== -1 && myRank > topCountTen && !isTouchDevice) {
        myRecord.textContent = `Finished ${myRank}th with ${allRows[myIndex].score.toLocaleString()} pts!`;
        myRecord.classList.remove('hidden');
    } else {
        myRecord.classList.add('hidden');
    }
}

rankingToggle.addEventListener('click', async function() {
    rankingExpanded = !rankingExpanded;
    const allRows = await getRanking();
    renderRanking(allRows);
    rankingList.classList.toggle('expanded', rankingExpanded);
});