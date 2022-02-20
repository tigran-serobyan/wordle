var express = require('express');
var router = express.Router();
var fs = require('fs');
var words = [];
var repeatingWords = [];
var nonRepeatingWords = [];
var swords = [];
var date = new Date();
var _date = date.getUTCDay();
var wordOfTheDay = '';

fs.readFile('./swords.txt', function (err, data) {
  let swords_ = data.toString('utf-8').split('\r\n');
  for (let w of swords_) {
    if (swords.indexOf(w) == -1) {
      swords.push(w);
    }
  }
  swords.sort()
  let i = Math.floor(Math.random() * swords.length);
  wordOfTheDay = swords[i].toUpperCase();
  swords.splice(i, 1);
  fs.writeFile('./swords.txt', swords.join('\r\n'), function (err) {
    if (err) {
      console.log(err);
    } else {
      fs.readFile('./nonRepeatingWords.txt', function (err, data) {
        let words_ = data.toString('utf-8').split('\r\n');
        for (let w of words_) {
          nonRepeatingWords.push(w);
        }
        nonRepeatingWords.sort()
        fs.readFile('./words.txt', function (err, data) {
          let words_ = data.toString('utf-8').split('\r\n');
          for (let w of words_) {
            if (words.indexOf(w) == -1) {
              words.push(w);
            }
          }
          words.sort();
          fs.readFile('./repeatingWords.txt', function (err, data) {
            let words_ = data.toString('utf-8').split('\r\n');
            for (let w of words_) {
              if (words.indexOf(w) == -1) {
                repeatingWords.push(w);
              }
            }
            repeatingWords.sort();
            fs.writeFile('./repeatingWords.txt', repeatingWords.join('\r\n'), function (err) {
              if (err) {
                console.log(err);
              } else {
                fs.writeFile('./words.txt', words.join('\r\n'), function (err) {
                  if (err) {
                    console.log(err);
                  } else {
                    fs.writeFile('./nonRepeatingWords.txt', nonRepeatingWords.join('\r\n'), function (err) {
                      if (err) {
                        console.log(err);
                      }
                    });
                  }
                });
              }
            });
          });
        });
      });
    }
  });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  if (_date != date.getUTCDay()) {
    _date = date.getUTCDay();
    let i = Math.floor(Math.random() * swords.length);
    wordOfTheDay = swords[i].toUpperCase();
    swords.splice(i, 1);
    fs.writeFile('./swords.txt', swords.join('\r\n'), function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
  res.render('index', { title: 'wordle', word: wordOfTheDay });
});

router.get('/checkWord/:word', function (req, res, next) {
  if (words.indexOf(req.params.word.toLowerCase()) == -1) {
    res.send(false);
    if (repeatingWords.indexOf(req.params.word.toLowerCase()) == -1) {
      repeatingWords.push(req.params.word.toLowerCase());
      fs.writeFile('./repeatingWords.txt', repeatingWords.join('\r\n'), function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  } else {
    res.send(true);
    if (nonRepeatingWords.indexOf(req.params.word.toLowerCase()) != -1) {
      nonRepeatingWords.splice(nonRepeatingWords.indexOf(req.params.word.toLowerCase()), 1);
      fs.writeFile('./nonRepeatingWords.txt', nonRepeatingWords.join('\r\n'), function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }
});

module.exports = router;
