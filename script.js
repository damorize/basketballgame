// Kezdeti értékek beállítása
var kezdetiek = [];
var kezdeti = -1;
var negyed = 0;
var level = 1;
var skill = 0;
var yourxp = 0;
var needxp = 20;
var statok = [1, 0, 0, 0, 0];
var alltimestatok = [0, 0, 0, 0, 0];
var allmatch = 0;
var isRunningMatch = false;
var wl = [0,0];
var allstatok=[0,0,0,0,0];

function adatokle() {
    // Adatok lekérése GET metódussal
    fetch('http://localhost:3002/getData')
        .then(response => response.json())
        .then(data => {
            lekeres(data);
            statupdate();  // Frissítsd a statokat miután lekérted az adatokat
            skillupdate(); // Frissítsd a skillt is miután lekérted az adatokat
        })
        .catch(error => console.error('Hiba történt:', error));

    function lekeres(data) {
        // Ellenőrizzük, hogy a válasz adatokat tartalmaz
        if (data && data[0]) {
            level = data[0].lvl;
            statok = [data[0].point, data[0].rebound, data[0].assist, data[0].block, data[0].steal];
            yourxp = data[0].yourxp;
            needxp = data[0].needxp;
            allmatch = data[0].matches;
            skill = data[0].skill;
            wl = [data[0].w, data[0].l];
            allstatok=[data[0].allpoint, data[0].allrebound, data[0].allassist, data[0].allblock, data[0].allsteal];
        } else {
            console.error("Nem található adat.");
        }
    };
}

function adatokfel() {
    // Adatok frissítése
    fetch('http://localhost:3002/updateLevel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playerId: 1,    // Az adott játékos ID-je
            newLevel: level,    // A frissítendő szint értéke
            pontok: statok[0], 
            lepattanok: statok[1],
            passzok: statok[2], 
            vedes: statok[3], 
            lopas: statok[4], 
            texp: yourxp, 
            kellxp: needxp, 
            meccsek: allmatch, 
            fejlesztheto: skill,
            w: wl[0],
            l: wl[1],
            allpoint:allstatok[0],
            allrebound:allstatok[1],
            allassist:allstatok[2],
            allblock:allstatok[3],
            allsteal:allstatok[4],
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Szerver válasz:", data);
        if (data.message) {
            console.log(data.message);  // Ha a válasz tartalmaz üzenetet, logoljuk
        }
    })
    .catch(error => console.error('Hiba történt:', error));
}
setTimeout(() => {statupdate();skillupdate();},1000);

// Kezdeti frissítés
adatokle();


// Statok frissítése
function statupdate() {
    document.getElementById("Point").innerHTML = statok[0];
    document.getElementById("Rebound").innerHTML = statok[1];
    document.getElementById("Assist").innerHTML = statok[2];
    document.getElementById("Block").innerHTML = statok[3];
    document.getElementById("Steal").innerHTML = statok[4];
    document.querySelector('.alltime').innerHTML = `PlayedMatches:${allmatch} ${wl[0]}W-${wl[1]}L <br> Points:${allstatok[0]} Rebounds:${allstatok[1]} Assists:${allstatok[2]} Blocks:${allstatok[3]} Steals:${allstatok[4]}`;
    document.getElementById("xpkiir").innerHTML = yourxp + '/'+needxp+' XP';  // Szöveg mindig tartalmazza a "XP" részt
    document.getElementById("xpmennyiseg").style.width = (yourxp / needxp) * 100 + "%";
    adatokfel();
}

// Szint és skill pontok frissítése
function skillupdate() {
    document.querySelector('.skill').innerText = "Skill Points: " + skill;
    document.querySelector('.level').innerText = "LVL: " + level;

    // Gombok engedélyezése/tiltása a skill pontok alapján
    const buttons = ["Point-Up", "Rebound-Up", "Assist-Up", "Block-Up", "Steal-Up"];
    buttons.forEach(button => {
        const btn = document.getElementById(button);
        if (skill > 0) {
            btn.disabled = false;
            btn.style.backgroundColor = "#ffdd57";
        } else {
            btn.disabled = true;
            btn.style.backgroundColor = "grey";
        }
    });
    adatokfel();
}

// Statok növelése
function spendp() { if (skill > 0) { statok[0]++; skill--; skillupdate(); statupdate(); } }
function spendr() { if (skill > 0) { statok[1]++; skill--; skillupdate(); statupdate(); } }
function spenda() { if (skill > 0) { statok[2]++; skill--; skillupdate(); statupdate(); } }
function spendb() { if (skill > 0) { statok[3]++; skill--; skillupdate(); statupdate(); } }
function spends() { if (skill > 0) { statok[4]++; skill--; skillupdate(); statupdate(); } }

// XP növelés és progress bar frissítése
function increaseXP() {
    yourxp += 10;

    // Ha elértük a szükséges XP-t, szintlépés
    while(yourxp >= needxp) {
        yourxp = yourxp-needxp;  // Nullázás szintlépésnél
        level++;
        skill++;
        needxp = Math.floor(needxp * 1.2);
    }

    // Frissítjük a progress bar szélességét és a szöveget
    document.getElementById("xpkiir").innerHTML = yourxp + '/'+needxp+' XP';  // Szöveg mindig tartalmazza a "XP" részt
    document.getElementById("xpmennyiseg").style.width = (yourxp / needxp) * 100 + "%";

    // Szint és skill pontok frissítése
    skillupdate();
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



async function start() {
    var currentmatch=[0,0,0,0,0];
    var enemypont=0;
    var yourpont=0;
    document.getElementById("match-start").disabled=true;
    document.getElementById("match-start").style.backgroundColor = "grey";
    document.getElementById('negyedstat').innerHTML ="";
    let negyed = 1;
    if (isRunningMatch) return;  // Ha már fut egy mérkőzés, ne indítsunk újat
    isRunningMatch = true;

    function cm(){
        currentmatch[0]+=current[0];
        currentmatch[1]+=current[1];
        currentmatch[2]+=current[2];
        currentmatch[3]+=current[3];
        currentmatch[4]+=current[4];
        allstatok[0]+=current[0];
        allstatok[1]+=current[1];
        allstatok[2]+=current[2];
        allstatok[3]+=current[3];
        allstatok[4]+=current[4];
    }

    let width = 0;
    const elem = document.getElementById("matchtime");

    while (width <= 101) {
        if (width === 25) {
            var current=[(getRandomInt(0, statok[0])),(getRandomInt(0, statok[1])),(getRandomInt(0, statok[2])),(getRandomInt(0, statok[3])),(getRandomInt(0, statok[4]))]
            cm();
            document.querySelector('.alltime').innerHTML = `PlayedMatches:${allmatch} ${wl[0]}W-${wl[1]}L <br> Points:${allstatok[0]} Rebounds:${allstatok[1]} Assists:${allstatok[2]} Blocks:${allstatok[3]} Steals:${allstatok[4]}`;
            document.getElementById("negyed").innerHTML = '1. negyed vége';
            document.getElementById('negyedstat').innerHTML += `<div style="word-spacing: 17px;">${negyed}.negyed: point:${current[0]} rebound:${current[1]} assist:${current[2]} block:${current[3]} steal:${current[4]}</div>`;
            await sleep(1000);  // 5 mp várakozás az első negyed végén
            negyed = 2;
        } else if (width === 50) {
            var current=[(getRandomInt(0, statok[0])),(getRandomInt(0, statok[1])),(getRandomInt(0, statok[2])),(getRandomInt(0, statok[3])),(getRandomInt(0, statok[4]))]
            cm();
            document.querySelector('.alltime').innerHTML = `PlayedMatches:${allmatch} ${wl[0]}W-${wl[1]}L <br> Points:${allstatok[0]} Rebounds:${allstatok[1]} Assists:${allstatok[2]} Blocks:${allstatok[3]} Steals:${allstatok[4]}`;
            document.getElementById("negyed").innerHTML = 'Félidő';
            document.getElementById('negyedstat').innerHTML += `<div style="word-spacing: 17px;">${negyed}.negyed: point:${current[0]} rebound:${current[1]} assist:${current[2]} block:${current[3]} steal:${current[4]}</div>`;
            await sleep(1000);  // 5 mp várakozás a félidő végén
            negyed = 3;
        } else if (width === 75) {
            var current=[(getRandomInt(0, statok[0])),(getRandomInt(0, statok[1])),(getRandomInt(0, statok[2])),(getRandomInt(0, statok[3])),(getRandomInt(0, statok[4]))]
            cm();
            document.querySelector('.alltime').innerHTML = `PlayedMatches:${allmatch} ${wl[0]}W-${wl[1]}L <br> Points:${allstatok[0]} Rebounds:${allstatok[1]} Assists:${allstatok[2]} Blocks:${allstatok[3]} Steals:${allstatok[4]}`;
            document.getElementById("negyed").innerHTML = '3. negyed vége';
            document.getElementById('negyedstat').innerHTML += `<div style="word-spacing: 17px;">${negyed}.negyed: point:${current[0]} rebound:${current[1]} assist:${current[2]} block:${current[3]} steal:${current[4]}</div>`;
            await sleep(1000);  // 5 mp várakozás a harmadik negyed végén
            negyed = 4;
        } else if (width === 100) {
            var current=[(getRandomInt(0, statok[0])),(getRandomInt(0, statok[1])),(getRandomInt(0, statok[2])),(getRandomInt(0, statok[3])),(getRandomInt(0, statok[4]))]
            cm();
            allmatch++;
            elem.style.width = 0 + "%";
            yourpont=getRandomInt(80, 130);
            enemypont=getRandomInt(80, 130);
            document.getElementById("negyed").innerHTML = 'Meccs vége';
            document.getElementById('negyedstat').innerHTML += `<div style="word-spacing: 17px;">${negyed}.negyed: point:${current[0]} rebound:${current[1]} assist:${current[2]} block:${current[3]} steal:${current[4]}</div>`;
            await sleep(600);
            document.getElementById('negyedstat').innerHTML += `<div style="word-spacing: 17px;">matchstats: point:${currentmatch[0]} rebound:${currentmatch[1]} assist:${currentmatch[2]} block:${currentmatch[3]} steal:${currentmatch[4]}</div>`;
            await sleep(600);
            if(yourpont ==enemypont) {yourpont++}
            document.getElementById('negyedstat').innerHTML += `<div>Te ${yourpont}-${enemypont} Enemy</div>`;
            await sleep(600);
            document.getElementById("match-start").disabled=false;
            document.getElementById("match-start").style.backgroundColor = "#ffdd57";
            if(yourpont>enemypont){
                document.getElementById('negyedstat').innerHTML += `<p id="eredmeny">WIN</p>`;
                document.getElementById('eredmeny').style.color = 'green';
                wl[0]++;
            }
            else if(yourpont<enemypont){
                document.getElementById('negyedstat').innerHTML += `<p id="eredmeny">LOSE</p>`;
                document.getElementById('eredmeny').style.color = 'red';
                wl[1]++;
            }
            document.querySelector('.alltime').innerHTML = `PlayedMatches:${allmatch} ${wl[0]}W-${wl[1]}L`;
            increaseXP();  // XP növelés és progress bar frissítése
            isRunningMatch = false;
            break;
        } else {
            document.getElementById("negyed").innerHTML = `${negyed}. negyed`;  // Aktuális negyed kijelzése
        }

        // Progress bar és szélesség frissítése minden lépésnél
        elem.style.width = width + "%";

        width++;  // Haladás minden lépés után
        await sleep(100);  // 100 ms várakozás minden lépés előtt
    }
}


// Kezdeti frissítés
statupdate();
skillupdate();
