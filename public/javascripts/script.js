let word = [];
let history;
let shareEmoji = { title: 'Բառուկ', text: 'բառուկ.հայ\n', url: window.location.origin }

let currentWord = [];
let guessCount = 0;
let enterInProgress = false;

let endOfGame = false;
let stats = [];
function start() {
    closeS()
    stats = localStorage.getItem('stats') ? JSON.parse(localStorage.getItem('stats')) : [];
    stats[wordNumber - 1] = stats[wordNumber - 1] ? stats[wordNumber - 1] : null;
    localStorage.setItem('stats', JSON.stringify(stats));
    if (!localStorage.getItem('a') && !localStorage.getItem('history')) {
        localStorage.setItem('a', 'a');
        openH();
    } else {
        closeH();
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
                            stats[wordNumber - 1] = (history[history.length - 1].join('') == word.join('')) ? guessCount : 'X';
                            let hranoush = [
                                "Հանճարեղ", "Հոյակապ", "Գերազանց", "Փայլուն", "Տպավորիչ", "Օ՜ֆ"
                            ];
                            if (stats[wordNumber - 1] == "X") {
                                alert_("Օրվա բառը։ " + word.join(""), false)
                            } else {
                                alert_(hranoush[stats[wordNumber - 1] - 1], false)
                            }
                            axios.post('/win/', { history, word: word.join('') }).then(function (res) {
                                // console.log(res);
                            })
                        }
                    }, 1500);
                } else {
                    enterInProgress = false;
                    alert_('Բառերի ցանկում այս բառը չկա');
                }
            });
        } else {
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

function alert_(data, shake = true) {
    let alert = document.createElement('p');
    alert.setAttribute('class', 'alert');
    if (shake) {
        document.getElementsByClassName('guessRow')[guessCount].setAttribute('class', 'guessRow shake');
    }
    alert.innerText = data;
    document.getElementsByTagName('main')[0].appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 1000);
    if (shake) {
        setTimeout(() => {
            document.getElementsByClassName('guessRow')[guessCount].setAttribute('class', 'guessRow');
        }, 500);
    }
}

function checkAll() {
    let guessRows = document.getElementsByClassName("guessRow");
    for (let r = 0; r < guessRows.length; r++) {
        let guessRight = true;
        let letters = guessRows[r].children;
        if (letters[0].innerText == '') {
            break;
        }
        let k = [];
        for (let i in letters) {
            k.push(letters[i].innerText);
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
        setTimeout(() => {
            keyboard();
            if (guessRight || guessCount >= 6) {
                endOfGame = true;
                endScreen();
            }
        }, 1500);
    }
    currentWord = [];
}

function endScreen() {
    let emoji = '';
    let letters = document.getElementsByClassName("guessLetter");
    let count = 0;
    for (let l in letters) {
        if (letters[l].className == 'guessLetter' || letters[l].className == undefined || l > 29) {
            break;
        }
        emoji += letters[l].className == 'guessLetter wrong' ? '⬛' : letters[l].className == 'guessLetter hit' ? '🟨' : '🟩';
        if (l % 5 == 4) {
            emoji += '\n';
            count++;
        }
    }
    shareEmoji = {
        title: '', text: ''
    }
    shareEmoji.text = 'Բառուկ ' + wordNumber + ' ' + ((history[history.length - 1].join('') == word.join('')) ? count : 'X') + '/6 \n' + emoji.slice(0, -1);
    shareEmoji.title = 'Բառուկ ' + wordNumber;
    stats[wordNumber - 1] = (history[history.length - 1].join('') == word.join('')) ? count : 'X';
    localStorage.setItem('stats', JSON.stringify(stats));
    openS();
}

function main() {
    timer();
    for (let i = 0; i < _word.length; i++) {
        if (_word[i + 1] == 'Ւ') {
            word.push(_word[i] + _word[i + 1]);
            i++;
        } else {
            word.push(_word[i]);
        }
    }
    for (let i in word) {
        if (word.indexOf(word[i], parseInt(i) + 1) != -1) {
            document.getElementById("doubleLetter").style.display = "block";
        }
    }
    if (word.join('') != localStorage.getItem('word')) {
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
        navigator.share(shareEmoji).then(() => {
        }).catch(err => {
            var emoji = document.createElement('textarea');
            emoji.innerText = shareEmoji.text
            emoji.focus();
            emoji.select();
            document.appendChild(emoji);
            try {
                var successful = document.execCommand('copy');
                alert_('Պատճենված', false);
                emoji.remove();
            } catch (err) {
                alert_('Չստացվեց', false);
                emoji.remove();
            }
        });
    } else {
        var emoji = document.createElement('textarea');
        emoji.innerText = shareEmoji.text
        emoji.focus();
        emoji.select();
        document.appendChild(emoji);
        try {
            var successful = document.execCommand('copy');
            alert_('Պատճենված');
            emoji.remove()
        } catch (err) {
            emoji.remove()
            alert_('Չստացվեց');
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
        if (history.length == i - 0 + 1 && stats[wordNumber - 1] != null) {
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