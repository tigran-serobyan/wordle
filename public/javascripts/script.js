const decrypt = (salt, encoded) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded.match(/.{1,2}/g).map((hex) => parseInt(hex, 16)).map(applySaltToChar).map((charCode) => String.fromCharCode(charCode + 1280)).join("");
};

let history;
let shareEmoji = { title: 'Բառուկ', text: 'բառուկ.հայ\n', url: window.location.origin }

let currentWord = [];
let guessCount = 0;
let enterInProgress = false;

let endOfGame = false;
let stats = [];
function start() {
    closeS();
    closeC();
    stats = localStorage.getItem('stats') ? JSON.parse(localStorage.getItem('stats')) : [];
    stats[wordNumber - 1] = stats[wordNumber - 1] ? stats[wordNumber - 1] : null;
    localStorage.setItem('stats', JSON.stringify(stats));
    let d = new Date(((new Date()).toLocaleString("en-US", { timeZone: "Asia/Yerevan" })));
    if (!localStorage.getItem('a') && !localStorage.getItem('history')) {
        localStorage.setItem("day", d.getDate())
        localStorage.setItem('a', 'a');
        openH();
    } else {
        closeH();
    }
    if (localStorage.getItem("day") != d.getDate()) {
        localStorage.setItem("day", d.getDate())
        location.reload()
    }
}

let intro = document.getElementById('intro')
function closeH() {
    document.getElementById('start').style.display = "none";
    intro.id = "";
}

function openH() {
    document.getElementById('start').style.display = "block";
    intro.id = "intro";
}

let cog = document.getElementById('cog')
function closeC() {
    document.getElementById('configs').style.display = "none";
    cog.id = "";
}

function openC() {
    document.getElementById('configs').style.display = "block";
    cog.id = "cog";
}

let statsd = document.getElementById('stats')
function closeS() {
    document.getElementById('stats_').style.display = "none";
    statsd.id = "";
}

function openS() {
    showStats();
    document.getElementById('stats_').style.display = "block";
    statsd.id = "stats";
}

function letter(letter) {
    if (currentWord.length < 5 && !endOfGame && !enterInProgress) {
        currentWord.push(letter);
        show();
    }
}

function show() {
    if (guessCount < 6) {
        let guessRows = document.getElementsByClassName("guessRow");
        let letters = guessRows[guessCount].getElementsByClassName("guessLetter");
        for (let i = 0; i < 5; i++) {
            letters[i].innerText = currentWord[i] ? currentWord[i] : "";
        }
    } else {
        endOfGame = true;
    }
}

function enter() {
    if (!enterInProgress) {
        enterInProgress = true;
        if (currentWord.length == 5) {
            axios.get('/checkWord/' + currentWord.join('')).then(function (response) {
                if (response.data) {
                    let guessRight = true;
                    history.push(currentWord);
                    localStorage.setItem('history', JSON.stringify(history));
                    let guessRows = document.getElementsByClassName("guessRow");
                    let letters = guessRows[guessCount].getElementsByClassName("guessLetter");
                    let k = [...currentWord];
                    let word = [];
                    for (let i = 0; i < decrypt("ԲԱՌՈՒԿ" + wordNumber, _word).length; i++) {
                        if (decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1] == 'Ւ') {
                            word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i] + decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1]);
                            i++;
                        } else {
                            word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i]);
                        }
                    }
                    let p = [...word]
                    for (let j = 0; j < p.length; j++) {
                        if (k[j] == p[j]) {
                            k[j] = "right";
                            p[j] = "";
                        }
                    }
                    for (let j = 0; j < p.length; j++) {
                        let b = true;
                        for (let i in k) {
                            if (b) {
                                if (k[i] == p[j]) {
                                    k[i] = "hit";
                                    p[j] = "";
                                    b = false;
                                }
                            }
                        }
                    }
                    for (let i in k) {
                        if (k[i] == 'right') {
                            setTimeout(() => {
                                letters[i].setAttribute('class', "guessLetter right");
                            }, i * 200);
                        } else if (k[i] == 'hit') {
                            guessRight = false;
                            setTimeout(() => {
                                letters[i].setAttribute('class', "guessLetter hit");
                            }, i * 200);
                        } else {
                            guessRight = false;
                            setTimeout(() => {
                                letters[i].setAttribute('class', "guessLetter wrong");
                            }, i * 200);
                        }
                    }
                    setTimeout(() => {
                        guessCount += 1;
                        currentWord = [];
                        keyboard();
                        enterInProgress = false;
                        if (guessRight || guessCount == 6) {
                            endOfGame = true;
                            endScreen();
                            let word = [];
                            for (let i = 0; i < decrypt("ԲԱՌՈՒԿ" + wordNumber, _word).length; i++) {
                                if (decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1] == 'Ւ') {
                                    word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i] + decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1]);
                                    i++;
                                } else {
                                    word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i]);
                                }
                            }
                            stats[wordNumber - 1] = (history[history.length - 1].join('') == word.join('')) ? guessCount : 'X';
                            let hranoush = [
                                "Հանճարեղ", "Հոյակապ", "Գերազանց", "Փայլուն", "Տպավորիչ", "Օ՜ֆ"
                            ];
                            if (stats[wordNumber - 1] == "X") {
                                alert_("Օրվա բառը։ " + word.join(""), false, 3000);
                            } else {
                                alert_(hranoush[stats[wordNumber - 1] - 1], false, 1500);
                            }
                            axios.post('/win/', { history, word: word.join('') }).then(function (res) {
                                // console.log(res);
                            })
                        }
                    }, 1500);
                } else {
                    enterInProgress = false;
                    alert_("Բառերի ցանկում այս բառը չկա");
                }
            });
        } else if (currentWord.length == 0) {
            alert_("Մուտքագրեք բառ")
            enterInProgress = false;
        }
        else {
            alert_("Բառը կարճ է")
            enterInProgress = false;
        }
    }
}
function backspace() {
    if (!enterInProgress) {
        currentWord.pop();
        show();
    }
}

function keyboard() {
    let guesses = document.getElementsByClassName("guesses")[0];
    let wrongs = guesses.getElementsByClassName("wrong");
    let rights = guesses.getElementsByClassName("right");
    let hits = guesses.getElementsByClassName("hit");
    let keys = document.getElementsByClassName("letter");
    for (let i in wrongs) {
        for (let k = 0; k < keys.length; k++) {
            if (wrongs[i].innerText == keys[k].innerText) {
                keys[k].setAttribute('class', "letter wrong");
            }
        }
    }

    for (let i in hits) {
        for (let k = 0; k < keys.length; k++) {
            if (hits[i].innerText == keys[k].innerText) {
                keys[k].setAttribute('class', "letter hit");
            }
        }
    }

    for (let i in rights) {
        for (let k = 0; k < keys.length; k++) {
            if (rights[i].innerText == keys[k].innerText) {
                keys[k].setAttribute('class', "letter right");
            }
        }
    }
}

function alert_(data, shake = true, time = 'auto') {
    if (document.getElementById('alert').childElementCount < 3) {
        let alert = document.createElement('p');
        alert.setAttribute('class', 'alert fadeIn');
        if (shake) {
            document.getElementsByClassName('guessRow')[guessCount].setAttribute('class', 'guessRow shake');
        }
        alert.innerText = data;
        document.getElementById('alert').appendChild(alert);
        setTimeout(() => {
            alert.setAttribute('class', 'alert fadeOut');
        }, time == 'auto' ? data.split(" ").length * 300 : time);
        setTimeout(() => {
            alert.remove();
        }, (time == 'auto' ? data.split(" ").length * 300 : time) + 145);
        if (shake) {
            setTimeout(() => {
                document.getElementsByClassName('guessRow')[guessCount].setAttribute('class', 'guessRow');
            }, 500);
        }
    }
}

function checkAll() {
    let guessRows = document.getElementsByClassName("guessRow");
    let guessRight = false;
    for (let r = 0; r < guessRows.length; r++) {
        let letters = guessRows[r].children;
        if (letters[0].innerText == '') {
            break;
        } else {
            guessRight = true;
        }
        let k = [];
        for (let i in letters) {
            k.push(letters[i].innerText);
        }
        let word = [];
        for (let i = 0; i < decrypt("ԲԱՌՈՒԿ" + wordNumber, _word).length; i++) {
            if (decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1] == 'Ւ') {
                word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i] + decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1]);
                i++;
            } else {
                word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i]);
            }
        }
        let p = [...word]
        for (let j = 0; j < p.length; j++) {
            if (k[j] == p[j]) {
                k[j] = "right";
                p[j] = "";
            }
        }
        for (let j = 0; j < p.length; j++) {
            let b = true;
            for (let i in k) {
                if (b) {
                    if (k[i] == p[j]) {
                        k[i] = "hit";
                        p[j] = "";
                        b = false;
                    }
                }
            }
        }
        for (let i = 0; i < 5; i++) {
            if (k[i] == 'right') {
                setTimeout(() => {
                    document.getElementsByClassName("guessRow")[r].getElementsByClassName("guessLetter")[i].setAttribute('class', "guessLetter right");
                }, i * 150 + r * 50);
            } else if (k[i] == 'hit') {
                guessRight = false;
                setTimeout(() => {
                    document.getElementsByClassName("guessRow")[r].getElementsByClassName("guessLetter")[i].setAttribute('class', "guessLetter hit");
                }, i * 150 + r * 50);
            } else {
                guessRight = false;
                setTimeout(() => {
                    document.getElementsByClassName("guessRow")[r].getElementsByClassName("guessLetter")[i].setAttribute('class', "guessLetter wrong");
                }, i * 150 + r * 50);
            }
        }
    }
    setTimeout(() => {
        keyboard();
        if (guessRight || guessCount >= 6) {
            endOfGame = true;
            if (stats[wordNumber - 1] == "X") {
                let word = [];
                for (let i = 0; i < decrypt("ԲԱՌՈՒԿ" + wordNumber, _word).length; i++) {
                    if (decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1] == 'Ւ') {
                        word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i] + decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1]);
                        i++;
                    } else {
                        word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i]);
                    }
                }
                alert_("Օրվա բառը։ " + word.join(""), false, 3000)
            }
            endScreen();
        }
    }, 1500);
    currentWord = [];
}

function endScreen() {
    count = setEmoji();
    let word = [];
    for (let i = 0; i < decrypt("ԲԱՌՈՒԿ" + wordNumber, _word).length; i++) {
        if (decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1] == 'Ւ') {
            word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i] + decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1]);
            i++;
        } else {
            word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i]);
        }
    }
    stats[wordNumber - 1] = (history[history.length - 1].join('') == word.join('')) ? count : 'X';
    localStorage.setItem('stats', JSON.stringify(stats));
    openS();
}

function setEmoji() {
    let emoji = '';
    let letters = document.getElementsByClassName("guessLetter");
    let count = 0;
    let blank;
    if (localStorage.getItem("color") == "device") {
        blank = darkThemeMq.matches ? '⬛' : '⬜';
    } else {
        blank = (localStorage.getItem("color") == "dark") ? '⬛' : '⬜';
    }
    let hit = (localStorage.getItem("colorM") == "greenYellow") ? '🟨' : '🟧';
    let right = (localStorage.getItem("colorM") == "greenYellow") ? '🟩' : '🟦';
    for (let l in letters) {
        if (letters[l].className == 'guessLetter' || letters[l].className == undefined || l > 29) {
            break;
        }
        emoji += letters[l].className == 'guessLetter wrong' ? blank : letters[l].className == 'guessLetter hit' ? hit : right;
        if (l % 5 == 4) {
            emoji += '\n';
            count++;
        }
    }
    shareEmoji = {
        title: '', text: ''
    }
    let word = [];
    for (let i = 0; i < decrypt("ԲԱՌՈՒԿ" + wordNumber, _word).length; i++) {
        if (decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1] == 'Ւ') {
            word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i] + decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1]);
            i++;
        } else {
            word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i]);
        }
    }
    shareEmoji.text = 'Բառուկ ' + wordNumber + ' ' + ((history[history.length - 1].join('') == word.join('')) ? count : 'X') + '/6 \n' + emoji.slice(0, -1);
    shareEmoji.title = 'Բառուկ ' + wordNumber;
    return count;
}

let darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
function main() {
    darkThemeMq.onchange = function (e) {
        if (localStorage.getItem("color") == "device" || !localStorage.getItem("color")) {
            style(e.matches ? "dark" : "light")
        }
    }
    if (localStorage.getItem("color") == "device" || !localStorage.getItem("color")) {
        style(darkThemeMq.matches ? "dark" : "light")
    } else {
        style(localStorage.getItem("color"))
    }
    if (!localStorage.getItem("colorM")) {
        localStorage.setItem("colorM", "greenYellow")
    }
    colorMode(localStorage.getItem("colorM"))
    timer();
    let word = [];
    for (let i = 0; i < decrypt("ԲԱՌՈՒԿ" + wordNumber, _word).length; i++) {
        if (decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1] == 'Ւ') {
            word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i] + decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i + 1]);
            i++;
        } else {
            word.push(decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)[i]);
        }
    }
    for (let i in word) {
        if (word.indexOf(word[i], parseInt(i) + 1) != -1) {
            document.getElementById("doubleLetter").style.display = "block";
        }
    }
    if (localStorage.getItem('word') == decrypt("ԲԱՌՈՒԿ" + wordNumber, _word)) {
        localStorage.setItem('word', _word);
    }
    if (_word != localStorage.getItem('word')) {
        localStorage.setItem('word', _word);
        localStorage.setItem('history', '');
    }
    history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
    if (history != []) {
        for (let p in history) {
            currentWord = history[p];
            show();
            guessCount++;
        }
        checkAll();
    }
}

function copyEmoji() {
    if (navigator.share) {
        navigator.share(shareEmoji).then(() => { })
    } else {
        var emoji = document.createElement('textarea');
        emoji.innerText = shareEmoji.text;
        document.body.appendChild(emoji);
        emoji.select();
        emoji.setSelectionRange(0, 99999);
        try {
            var successful = document.execCommand("copy");
            alert_('Պատճենված', false, 1000);
            emoji.remove()
        } catch (err) {
            emoji.remove()
            alert_('Չստացվեց', false, 1000);
        }
    }
}

function showStats() {
    s = true;
    cStreak = 0;
    mStreak = 0;
    gCount = 0;
    wCount = 0;
    ms = 0;
    wStats = [0, 0, 0, 0, 0, 0];
    for (let i = stats.length - 1; i >= 0; i--) {
        if (stats[i] == null || stats[i] == 'X') {
            if (stats[i] == 'X') {
                gCount++;
            }
            s = false;
            if (ms > mStreak) {
                mStreak = ms;
            }
            ms = 0;
        } else {
            if (s) {
                cStreak++;
            }
            ms++;
            gCount++;
            wCount++;
            wStats[stats[i] - 1]++;
        }
    }
    if (ms > mStreak) {
        mStreak = ms;
    }
    wCount = gCount ? Math.round(wCount / gCount * 100) : 0;
    document.getElementById('wcount').innerText = wCount + '%';
    document.getElementById('gcount').innerText = gCount;
    document.getElementById('cstreak').innerText = cStreak;
    document.getElementById('mstreak').innerText = mStreak;
    for (let i in wStats) {
        document.getElementsByClassName('guessC')[i].innerText = wStats[i];
        document.getElementsByClassName('guessC')[i].style.width = "calc(" + wStats[i] / (max(wStats) ? max(wStats) : 1) * 85 + "% + 10%";
        if (history.length == i - 0 + 1 && stats[wordNumber - 1] != null && stats[wordNumber - 1] != "X") {
            document.getElementsByClassName('guessC')[i].className = "guessC today";
        } else {
            document.getElementsByClassName('guessC')[i].className = "guessC";
        }
    }
}

function max(arr) {
    let max_ = arr[0]
    for (let i in arr) {
        if (arr[i] > max_) {
            max_ = arr[i]
        }
    }
    return max_;
}

function timer() {
    let d = new Date(((new Date()).toLocaleString("en-US", { timeZone: "Asia/Yerevan" })));
    let hour = ((d.getHours() > 13) ? "0" : "") + (23 - d.getHours());
    let minute = ((d.getMinutes() > 49) ? "0" : "") + (59 - d.getMinutes());
    let seconds = ((d.getSeconds() > 49) ? "0" : "") + (59 - d.getSeconds());
    document.getElementById("time").innerText = hour + ":" + minute + ":" + seconds + "-ից"
    if (hour != "00" || minute != "00" || seconds != "00") {
        setTimeout(() => {
            timer();
        }, 500);
    }
}

function color(e) {
    if (e.id == "colordark") {
        localStorage.setItem("color", "dark")
        style("dark")
    }
    if (e.id == "colorlight") {
        localStorage.setItem("color", "light")
        style("light")
    }
    if (e.id == "colordevice") {
        localStorage.setItem("color", "device")
        style(darkThemeMq.matches ? "dark" : "light")
    }
    document.getElementById("color" + localStorage.getItem("color"))
}

function style(color = "") {
    for (b of document.getElementsByClassName("color")) {
        b.className = "color";
    }
    if (!localStorage.getItem("color")) {
        localStorage.setItem("color", "device");
    }
    document.getElementById("color" + localStorage.getItem("color")).className = "color active"
    if (!shareEmoji.url) {
        setEmoji();
    }
    if (color) {
        document.getElementById("style").href = "/stylesheets/" + color + ".css";
    } else {
        if (document.getElementById("style").href.split("/")[document.getElementById("style").href.split("/").length - 1] == "light.css") {
            document.getElementById("style").href = "/stylesheets/dark.css";
        } else {
            document.getElementById("style").href = "/stylesheets/light.css";
        }
    }
}

function colorM(e) {
    if (e.id == "colorgreenYellow") {
        localStorage.setItem("colorM", "greenYellow")
        colorMode("greenYellow")
    }
    if (e.id == "colororangeBlue") {
        localStorage.setItem("colorM", "orangeBlue")
        colorMode("orangeBlue")
    }
    document.getElementById("color" + localStorage.getItem("colorM"))
}

function colorMode(mode = "") {
    for (b of document.getElementsByClassName("colorM")) {
        b.className = "colorM";
    }
    if (!localStorage.getItem("colorM")) {
        localStorage.setItem("colorM", "greenYellow");
    }
    document.getElementById("color" + localStorage.getItem("colorM")).className = "colorM active";
    if (!shareEmoji.url) {
        setEmoji();
    }
    if (mode) {
        document.getElementById("colorMode").href = "/stylesheets/" + mode + ".css";
    } else {
        if (document.getElementById("colorMode").href.split("/")[document.getElementById("colorMode").href.split("/").length - 1] == "orangeBlue") {
            document.getElementById("colorMode").href = "/stylesheets/greenYellow.css";
            document.getElementById("icon").href = "/stylesheets/images/logo.png";
            document.getElementById("appleIcon").href = "/stylesheets/images/logo.png";
        } else {
            document.getElementById("colorMode").href = "/stylesheets/orangeBlue.css";
            document.getElementById("icon").href = "/stylesheets/images/logoBlue.png";
            document.getElementById("appleIcon").href = "/stylesheets/images/logoBlue.png";
        }
    }
}

letterObj = { "KeyA": "Ա", "KeyB": "Բ", "KeyG": "Գ", "KeyD": "Դ", "KeyE": "Ե", "KeyZ": "Զ", "Digit1": "Է", "KeyY": "Ը", "Digit2": "Թ", "Equal": "Ժ", "KeyI": "Ի", "KeyL": "Լ", "BracketLeft": "Խ", "BracketRight": "Ծ", "KeyK": "Կ", "KeyH": "Հ", "Digit4": "Ձ", "KeyX": "Ղ", "Digit0": "Ճ", "KeyM": "Մ", "KeyJ": "Յ", "KeyN": "Ն", "Backslash": "Շ", "KeyW": "Ո", "Digit9": "Չ", "KeyP": "Պ", "Digit5": "Ջ", "KeyR": "Ռ", "KeyS": "Ս", "KeyV": "Վ", "KeyT": "Տ", "Digit8": "Ր", "KeyC": "Ց", "KeyU": "ՈՒ", "Digit3": "Փ", "KeyQ": "Ք", "Digit7": "ԵՒ", "KeyF": "Ֆ", "KeyO": "Օ" }

document.addEventListener('keydown', logKey);

function logKey(e) {
    if (e.code == "Enter") {
        enter();
    }
    if (e.code == "Backspace") {
        backspace();
    }
    if (letterObj[e.code]) {
        letter(letterObj[e.code]);
    }
}
