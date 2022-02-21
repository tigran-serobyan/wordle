let word = [];
let history;
let share = { title: '', text: '', url: window.location.origin }

let currentWord = [];
let guessCount = 0;
let enterInProgress = false;

let endOfGame = false;

function start() {
    if (!localStorage.getItem('a') && !localStorage.getItem('history')) {
        localStorage.setItem('a', 'a');
        openH();
    } else {
        closeH();
    }
}

function closeH() {
    document.getElementById('start').style.display = "none";
}

function openH() {
    document.getElementById('start').style.display = "block";
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
                    for (let i in currentWord) {
                        setTimeout(() => {
                            let k = [];
                            for (let j in word) {
                                if (word[j] == currentWord[i]) {
                                    k.push(j);
                                }
                            }
                            if (k.length > 1) {
                                let right = true;
                                for (let j of k) {
                                    if (currentWord[j] != word[j]) {
                                        right = false;
                                    }
                                }
                                if (right && word[i] == letters[i].innerText) {
                                    letters[i].setAttribute('class', "guessLetter right");
                                } else {
                                    letters[i].setAttribute('class', "guessLetter hit");
                                    guessRight = false;
                                }
                            } else if (k.length == 1) {
                                if (k[0] == i) {
                                    letters[i].setAttribute('class', "guessLetter right");
                                } else if (k[0]) {
                                    letters[i].setAttribute('class', "guessLetter hit");
                                    guessRight = false;
                                }
                            } else {
                                letters[i].setAttribute('class', "guessLetter wrong");
                                guessRight = false;
                            }
                        }, i * 200);
                    }
                    setTimeout(() => {
                        guessCount += 1;
                        currentWord = [];
                        keyboard();
                        enterInProgress = false;
                        if (guessRight || guessCount == 6) {
                            endOfGame = true;
                            endScreen();
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
    for (let r in guessRows) {
        let guessRight = true;
        let letters = guessRows[r].getElementsByClassName("guessLetter");
        if (letters[0].innerText == '') {
            break;
        }
        let currentWord_ = [];
        for (let i in letters) {
            currentWord_.push(letters[i].innerText);
        }
        for (let i in currentWord_) {
            setTimeout(() => {
                let k = [];
                for (let j in word) {
                    if (word[j] == currentWord_[i]) {
                        k.push(j);
                    }
                }
                if (letters[i]) {
                    if (k.length > 1) {
                        let right = true;
                        for (let j of k) {
                            if (currentWord_[j] != word[j]) {
                                right = false;
                            }
                        }
                        if (right && word[i] == letters[i].innerText) {
                            letters[i].setAttribute('class', "guessLetter right");
                        } else {
                            letters[i].setAttribute('class', "guessLetter hit");
                            guessRight = false;
                        }
                    } else if (k.length == 1) {
                        if (k[0] == i) {
                            letters[i].setAttribute('class', "guessLetter right");
                        } else if (k[0]) {
                            letters[i].setAttribute('class', "guessLetter hit");
                            guessRight = false;
                        }
                    } else {
                        letters[i].setAttribute('class', "guessLetter wrong");
                        guessRight = false;
                    }
                }
            }, i * 150 + r * 50);
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
    let _share = document.createElement('div');
    _share.setAttribute('class', 'share');
    _share.innerHTML = '<span onclick="c()" class="close"></span><p>Այսօրվա բառը։ ' + word.join('') + '</p>';
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
    share.text = 'Բառուկ ' + wordNumber + ' ' + count + '/6 \n' + emoji;
    share.title = 'Բառուկ ' + wordNumber + ' ' + count + '/6';
    _share.innerHTML += '';
    _share.innerHTML += '<button class="shareButton" onclick="copyEmoji()">Կիսվել</button>';
    _blur = document.getElementsByClassName('blur')[0];
    _blur.lastChild.remove();
    _blur.appendChild(_share);
    _blur.style.display = "block";
}

function main() {
    c();
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

function c() {
    document.getElementsByClassName("blur")[0].style.display = "none";
}

function copyEmoji() {
    if (navigator.share) {
        navigator.share(share).then(() => {
        }).catch(err => {
            var emoji = document.createElement('textarea');
            emoji.innerText = share.title + '\n' + share.text
            emoji.focus();
            emoji.select();
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
        emoji.innerText = share.title + '\n' + share.text
        emoji.focus();
        emoji.select();
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
