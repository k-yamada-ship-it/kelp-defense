const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// 画面サイズをiPadに合わせる
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let urchins = [];
let gameActive = true;
let kelpHeight = 100; // コンブの初期の長さ

// 画像の準備
const kelpImg = new Image();
kelpImg.src = 'assets/kelp.png';

const urchinImg = new Image();
urchinImg.src = 'assets/urchin.png';

// ウニの出現（難易度調整用）
function spawnUrchin() {
    if (!gameActive) return;
    urchins.push({
        x: Math.random() * (canvas.width - 60) + 30,
        y: Math.random() * (canvas.height - 200) + 50, 
        size: 60,
        rotation: 0 // ウニを回転させて動いている感を出す
    });
}

// タッチ・クリックでウニを食べる
function handleInput(e) {
    if (!gameActive) {
        resetGame(); // ゲームオーバー時はリセット
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    urchins = urchins.filter(urchin => {
        const dist = Math.hypot(urchin.x - x, urchin.y - y);
        if (dist < urchin.size / 1.2) {
            score += 100;
            scoreElement.innerText = `食べたウニ: ${score}`;
            return false; // ウニを消す
        }
        return true;
    });
}

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(e); }, {passive: false});
canvas.addEventListener('mousedown', handleInput);

function resetGame() {
    score = 0;
    kelpHeight = 100;
    urchins = [];
    gameActive = true;
    scoreElement.innerText = `食べたウニ: ${score}`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景の海を描画（グラデーション）
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0077be");
    grad.addColorStop(1, "#001a33");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. コンブを伸ばす
    if (gameActive) kelpHeight += 0.15; 
    const kelpY = canvas.height - kelpHeight;

    // 2. コンブを描画
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.drawImage(kelpImg, i, kelpY, 50, kelpHeight);
    }

    // 3. ウニを描画・衝突判定
    urchins.forEach(urchin => {
        urchin.rotation += 0.02; // ウニをゆっくり回す
        ctx.save();
        ctx.translate(urchin.x, urchin.y);
        ctx.rotate(urchin.rotation);
        ctx.drawImage(urchinImg, -urchin.size/2, -urchin.size/2, urchin.size, urchin.size);
        ctx.restore();

        // 当たり判定：コンブがウニに触れたら負け
        if (kelpY < urchin.y + urchin.size/3) {
            gameActive = false;
        }
    });

    // ゲームオーバー表示
    if (!gameActive) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("コンブが食われた！", canvas.width/2, canvas.height/2);
        ctx.font = "20px sans-serif";
        ctx.fillText("タップでリトライ", canvas.width/2, canvas.height/2 + 50);
    }

    requestAnimationFrame(draw);
}

// 1.2秒ごとにウニを出す
setInterval(spawnUrchin, 1200);

// 画像が読み込まれてから開始
window.onload = () => {
    draw();
};
