document.addEventListener("DOMContentLoaded", () => {

    const problemArea = document.getElementById('problem-area');
    const messageArea = document.getElementById('message-area');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const livesDisplay = document.getElementById('lives');
    const levelDisplay = document.getElementById('level');
    const xpDisplay = document.getElementById('xp');
    const background = document.getElementById('background');
    const wizardImg = document.getElementById('wizard-img');
    const monsterImg = document.getElementById('monster-img');
    const startMusicBtn = document.getElementById('start-music-btn');

    const bgMusic = document.getElementById('bg-music');
    const magicSound = document.getElementById('magic-sound');
    const hitSound = document.getElementById('hit-sound');

    let lives = 3;
    let level = 1;
    let xp = 0;
    let xpToNextLevel = 100;
    let currentAnswer = 0;
    let currentType = "";
    let firstProblemSolved = false;
    let currentMonster = '';
    let bossDefeated = false;
    let inputEnabled = false;
    let gameOver = false;
    let lastLevelMusic = 1;

    bgMusic.src = 'audio/valle.mp3';
    bgMusic.loop = true;
    bgMusic.volume = 0.6;

    startMusicBtn.addEventListener('click', () => {
        bgMusic.play().catch(() => {});
        [magicSound, hitSound].forEach(audio => {
            audio.volume = 1.0;
            audio.currentTime = 0;
            audio.play().then(() => audio.pause());
        });
        startMusicBtn.style.display = 'none';
    });

    function showMessage(msg, duration = 3000, overrideInitial = false) {
        if (gameOver && msg.includes("VICTORY")) return;
        messageArea.innerHTML = msg;
        setTimeout(() => {
            if (msg !== "¡Eres un Mago!" || firstProblemSolved || overrideInitial) {
                messageArea.innerHTML = "";
            }
        }, duration);
    }

    function updateBackground(level, callback) {
        let bg = '';
        let music = '';

        switch(level) {
            case 1: bg = 'img/valle.jpg'; music = 'audio/valle.mp3'; break;
            case 2: bg = 'img/mazmorras.jpg'; music = 'audio/mazmorras.mp3'; break;
            case 3: bg = 'img/bosque.jpg'; music = 'audio/bosque.mp3'; break;
            case 4: bg = 'img/isla.jpg'; music = 'audio/isla.mp3'; break;
            case 5: bg = 'img/castillo.jpg'; music = 'audio/castillo.mp3'; break;
        }

        const img = new Image();
        img.src = bg;
        img.onload = () => {
            background.style.backgroundImage = `url('${bg}')`;

            if (lastLevelMusic !== level && startMusicBtn.style.display === 'none') {
                lastLevelMusic = level;
                bgMusic.pause();
                bgMusic.src = music;
                bgMusic.play().catch(() => {});
            }

            if (callback) callback();
        };
    }

    function showProblem(problem) {
        problemArea.innerHTML = problem;
    }

    function showInput() {
        if (gameOver) return;
        answerInput.value = "";
        answerInput.style.display = "inline-block";
        submitBtn.style.display = "inline-block";
        answerInput.focus();
        inputEnabled = true;
    }

    function chooseMonster(level) {
        let monsters = [];
        switch(level){
            case 1: monsters = ['Aguila','Araña']; break;
            case 2: monsters = ['Goblin','Esqueleto']; break;
            case 3: monsters = ['Vampiro','Gorgona']; break;
            case 4: monsters = ['Wyvern','Gigantes']; break;
            case 5: monsters = ['Dragon','Titan']; break;
        }
        return monsters[Math.floor(Math.random() * monsters.length)];
    }

    function setMonsterImage(name){
        monsterImg.src = `img/${name.toLowerCase()}.png`;
    }

    function wizardAttack(){
        magicSound.currentTime = 0;
        magicSound.play();
        wizardImg.style.transform = 'translateX(60px)';
        setTimeout(()=> wizardImg.style.transform = 'translateX(0)', 500);
    }

    function monsterAttack(){
        hitSound.currentTime = 0;
        hitSound.play();
        monsterImg.style.transform = 'translateX(-60px)';
        setTimeout(()=> monsterImg.style.transform = 'translateX(0)', 500);
    }

    function generateProblem() {
        if (gameOver) return;
        inputEnabled = false;
        updateBackground(level);
        currentMonster = chooseMonster(level);
        setMonsterImage(currentMonster);

        let num1, num2, op;

        if(level === 1){
            op = Math.random() < 0.5 ? "+" : "-";
            num1 = Math.floor(Math.random()*20)+1;
            num2 = Math.floor(Math.random()*20)+1;
            currentType = "simple";
        } else if(level === 2){
            op = Math.random() < 0.5 ? "*" : "/";
            num1 = Math.floor(Math.random()*10)+1;
            num2 = Math.floor(Math.random()*10)+1;
            if(op === "/") num1 = num2 * Math.floor(Math.random()*10+1);
            currentType = "mid";
        } else if(level >=3 && level<5){
            const choice = Math.random();
            if(choice < 0.5){
                const num3 = Math.floor(Math.random()*10)+1;
                num1 = Math.floor(Math.random()*10)+1;
                num2 = Math.floor(Math.random()*10)+1;
                currentAnswer = num1 + num2 * num3;
                currentType = "complex";
                showProblem(`${num1} + ${num2} * ${num3}`);
                showInput();
                return;
            } else {
                const a = Math.floor(Math.random()*5)+1;
                const x = Math.floor(Math.random()*10)+1;
                const b = Math.floor(Math.random()*10);
                const c = a*x + b;
                currentAnswer = x;
                currentType = "complex";
                showProblem(`${a}x + ${b} = ${c}`);
                showInput();
                return;
            }
        } else if(level===5){
            const a = Math.floor(Math.random()*10)+1;
            const b = Math.floor(Math.random()*10);
            const x = Math.floor(Math.random()*10)+1;
            const c = a*x + b;
            currentAnswer = x;
            currentType = "boss";
            showProblem(`¡Jefe Final! Resuelve: ${a}x + ${b} = ${c}`);
            showInput();
            return;
        }

        currentAnswer = eval(`${num1} ${op} ${num2}`);
        showProblem(`${num1} ${op} ${num2}`);
        showInput();
    }

    function gainXP(){
        if (gameOver) return;
        let gained = 0;
        if(currentType==="simple") gained=25;
        else if(currentType==="mid") gained=50;
        else gained=100;

        xp += gained;
        xpDisplay.innerText = `XP: ${xp}`;
        showMessage(`¡Correcto! Ganaste ${gained} XP.`, 3000, true);

        if (!firstProblemSolved) firstProblemSolved = true;

        while(xp >= xpToNextLevel){
            xp -= xpToNextLevel;
            level++;
            xpToNextLevel *= 2;
            levelDisplay.innerText = `Nivel: ${level}`;
            showMessage(`¡Subiste de nivel! Ahora eres nivel ${level}`, 3000, true);
        }

        if(currentType==="boss"){
            bossDefeated = true;
            gameOver = true;

            background.style.backgroundImage = `url('img/valle.jpg')`;
            bgMusic.pause();
            bgMusic.src = 'audio/valle.mp3';
            bgMusic.play().catch(() => {});

            monsterImg.style.display = 'none';
            answerInput.style.display="none";
            submitBtn.style.display="none";
            problemArea.innerHTML="";

            mostrarVictoryModal("VICTORY!", "Gracias por jugar");
        }
    }

    function checkAnswer(){
        if(!inputEnabled || gameOver) return;
        inputEnabled = false;

        const userAnswer = parseInt(answerInput.value);
        if(isNaN(userAnswer)) return;

        if(userAnswer === currentAnswer){
            gainXP();
            wizardAttack();
        } else {
            lives--;
            livesDisplay.innerText = `Vidas: ${lives}`;
            showMessage(`Incorrecto. Te quedan ${lives} vidas.`, 3000, true);
            monsterAttack();

            if(lives <= 0){
                gameOver = true;
                mostrarVictoryModal("GAME OVER!", "Gracias por jugar");
            }
        }

        setTimeout(generateProblem, 3000);
    }

    submitBtn.addEventListener("click", checkAnswer);
    answerInput.addEventListener("keyup", (event)=>{
        if(event.key==="Enter") checkAnswer();
    });

    showMessage("¡Eres El Mago Rana! Resuelve los problemas matemáticos para ganar experiencia y subir de nivel.", 10000);
    updateBackground(1, generateProblem);

    // === Modal Victory estilizado ===
    function mostrarVictoryModal(titulo, mensaje) {
        const modal = document.createElement('div');
        modal.id = 'modal';
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.backgroundColor = "rgba(0,0,0,0.8)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "1000";

        const content = document.createElement('div');
        content.style.backgroundColor = "white";
        content.style.padding = "40px 50px";
        content.style.borderRadius = "12px";
        content.style.textAlign = "center";

        const titleEl = document.createElement('div');
        titleEl.innerHTML = titulo;
        titleEl.style.fontSize = "48px";
        titleEl.style.fontWeight = "bold";
        titleEl.style.color = "gold";
        titleEl.style.marginBottom = "20px";

        const messageEl = document.createElement('div');
        messageEl.innerHTML = mensaje;
        messageEl.style.fontSize = "24px";
        messageEl.style.color = "black";

        content.appendChild(titleEl);
        content.appendChild(messageEl);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

});
