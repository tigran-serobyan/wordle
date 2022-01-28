let word = [];

let currentWord = [];
let guessCount = 0;

let endOfGame = false;

function letter(letter) {
    if (currentWord.length < 5 && !endOfGame) {
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
                    if (guessRight || guessCount == 6) {
                        endOfGame = true;
                        endScreen();
                    }
                }, 1500);
            } else {
                alert_('Բառերի ցանկում այս բառը չկա');
            }
        });
    }
}

function backspace() {
    currentWord.pop();
    show();
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

function alert_(data) {
    let alert = document.createElement('p');
    alert.setAttribute('class', 'alert');
    alert.innerText = data;
    document.getElementsByTagName('main')[0].appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 3000);
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
            }, i * 150 +r*50);
        }
        setTimeout(() => {
            keyboard();
            if (guessRight || guessCount == 6) {
                endOfGame = true;
                endScreen();
            }
        }, 2000);
    }
    currentWord = [];
}

function endScreen() {
    let share = document.createElement('div');
    share.setAttribute('class', 'share');
    share.innerHTML = '<p>Այսօրվա բառը։ ' + word.join('') + '</p>';
    let emoji = '';
    let letters = document.getElementsByClassName("guessLetter");
    let count = 0;
    for (let l in letters) {
        if (letters[l].className == 'guessLetter' || letters[l].className == undefined || l > 29) {
            break;
        }
        emoji += letters[l].className == 'guessLetter wrong' ? '⬛' : letters[l].className == 'guessLetter hit' ? '🟨' : '🟩';
        if (l % 5 == 4) {
            emoji += '<br>';
            count++;
        }
    }
    emoji = 'Wordle '+count + ' / 6 <br>' + emoji;
    share.innerHTML += '<p class="emoji">' + emoji + '</p>';
    document.getElementsByTagName('main')[0].appendChild(share);
}