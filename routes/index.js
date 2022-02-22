var express = require('express');
var router = express.Router();
var fs = require('fs');
var words = [];
var repeatingWords = [];
var nonRepeatingWords = [];
var swords = [];
var date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Yerevan" }));
var _date = date.getDay();
var wordOfTheDay = '';
var wordNumber = Math.floor((date - new Date("Mon Feb 21 2022 00:00:00 GMT+0400")) / 86400000);

fs.readFile('./swords.txt', function (err, data) {
  let swords_ = data.toString('utf-8').split('\n');
  for (let w of swords_) {
    if (swords.indexOf(w) == -1) {
      swords.push(w);
    }
  }
  swords.sort()
  let i = Math.floor(Math.random() * swords.length);
  wordOfTheDay = swords[i].toUpperCase();
  wordNumber += 1;
  swords.splice(i, 1);
  fs.writeFile('./swords.txt', swords.join('\n'), function (err) {
    if (err) {
      console.log(err);
    } else {
      fs.readFile('./nonRepeatingWords.txt', function (err, data) {
        let words_ = data.toString('utf-8').split('\n');
        for (let w of words_) {
          nonRepeatingWords.push(w);
        }
        nonRepeatingWords.sort()
        fs.readFile('./words.txt', function (err, data) {
          let words_ = data.toString('utf-8').split('\n');
          for (let w of words_) {
            if (words.indexOf(w) == -1) {
              words.push(w);
            }
          }
          words.sort();
          fs.readFile('./repeatingWords.txt', function (err, data) {
            let words_ = data.toString('utf-8').split('\n');
            for (let w of words_) {
              if (words.indexOf(w) == -1) {
                repeatingWords.push(w);
              }
            }
            repeatingWords.sort();
            fs.writeFile('./repeatingWords.txt', repeatingWords.join('\n'), function (err) {
              if (err) {
                console.log(err);
              } else {
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
  date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Yerevan" }));
  if (_date != date.getDay()) {
    _date = date.getDay();
    let i = Math.floor(Math.random() * swords.length);
    wordOfTheDay = swords[i].toUpperCase();
    swords.splice(i, 1);
    wordNumber += 1;
    fs.writeFile('./swords.txt', swords.join('\n'), function (err) {
      if (err) {
        console.log(err);
      } else {
        fs.readFile('./swords.txt', function (err, data) {
          console.log(data.toString('utf-8').split('\n'));
          console.log("\n\n\n")
          fs.readFile('./repeatingWords.txt', function (err, data) {
            console.log(data.toString('utf-8').split('\n'))
          })
        })
      }
    });
  }
  res.render('index', { title: 'Բառուկ | Արևելահայերեն', word: wordOfTheDay, wordNumber });
});

router.get('/checkWord/:word', function (req, res, next) {
  if (words.indexOf(req.params.word.toLowerCase()) == -1) {
    res.send(false);
    if (repeatingWords.indexOf(req.params.word.toLowerCase()) == -1) {
      repeatingWords.push(req.params.word.toLowerCase());
      fs.writeFile('./repeatingWords.txt', repeatingWords.join('\n'), function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  } else {
    res.send(true);
    if (nonRepeatingWords.indexOf(req.params.word.toLowerCase()) != -1) {
      nonRepeatingWords.splice(nonRepeatingWords.indexOf(req.params.word.toLowerCase()), 1);
      fs.writeFile('./nonRepeatingWords.txt', nonRepeatingWords.join('\n'), function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }
});

module.exports = router;
