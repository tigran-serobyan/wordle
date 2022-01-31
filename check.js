var express = require('express');
var app = express();
var server = require('http').Server(app);
var fs = require('fs');
var words = [];
var repeatingWords = [];
var nonRepeatingWords = [];

fs.readFile('./repeatingWords.txt', function (err, data) {
    let words_ = data.toString('utf-8').split('\n');
    for (let w of words_) {
        repeatingWords.push(w);

    }
    repeatingWords.sort()
    fs.readFile('./nonRepeatingWords.txt', function (err, data) {
        let words_ = data.toString('utf-8').split('\n');
        for (let w of words_) {
            if (nonRepeatingWords.indexOf(w) == -1) {
                nonRepeatingWords.push(w);
            }
        }
        nonRepeatingWords.sort();
        fs.readFile('./words.txt', function (err, data) {
            let words_ = data.toString('utf-8').split('\n');
            for (let w of words_) {
                if (words.indexOf(w) == -1) {
                    words.push(w);
                }
            };
            words.sort();
            wordOfTheDay = words[Math.ceil(Math.random() * (words.length - 1))].toUpperCase();
            fs.writeFile('./words.txt', words.join('\n'), function (err) {
                if (err) {
                    console.log(err);
                } else {
                    fs.writeFile('./nonRepeatingWords.txt', nonRepeatingWords.join('\n'), function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
    });
});

app.use('/', express);
app.set('port', process.env.PORT || '80');
app.get('/', function (req, res, next) {
    console.log(req, res);
    if (words.indexOf(req.query.word.toLowerCase()) == -1) {
        res.send(false);
        if (repeatingWords.indexOf(req.query.word.toLowerCase()) == -1) {
            repeatingWords.push(req.query.word.toLowerCase());
            fs.writeFile('./repeatingWords.txt', repeatingWords.join('\r\n'), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    } else {
        res.send(true);
        if (nonRepeatingWords.indexOf(req.query.word.toLowerCase()) != -1) {
            nonRepeatingWords.splice(nonRepeatingWords.indexOf(req.query.word.toLowerCase()), 1);
            fs.writeFile('./nonRepeatingWords.txt', nonRepeatingWords.join('\r\n'), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
});
server.listen(process.env.PORT || '80');