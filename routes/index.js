var express = require('express');
var router = express.Router();
var fs = require('fs');
var words = [];
var repeatingWords = [];
var nonRepeatingWords = [];
var swords = [];
var stats = [];
var date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Yerevan" }));
var _date = date.getDay();
console.log(date);
var wordOfTheDay = '';
var wordNumber = Math.floor((date - new Date("Mon Feb 21 2022 00:00:00 GMT+0400")) / 86400000);

fs.readFile('./stats.txt', function (err, data) {
  stats = JSON.parse(data.toString('utf-8'));
  fs.readFile('./swords.txt', function (err, data) {
    let swords_ = JSON.parse(data.toString('utf-8'));
    for (let w of swords_) {
      if (swords.indexOf(w) == -1) {
        swords.push(w);
      }
    }
    wordOfTheDay = swords[wordNumber].toUpperCase();
    wordNumber += 1;
    fs.writeFile('./swords.txt', JSON.stringify(swords), function (err) {
      if (err) {
        console.log(err);
      } else {
        fs.readFile('./nonRepeatingWords.txt', function (err, data) {
          let words_ = JSON.parse(data.toString('utf-8'));
          for (let w of words_) {
            nonRepeatingWords.push(w);
          }
          nonRepeatingWords.sort()
          fs.readFile('./words.txt', function (err, data) {
            let words_ = JSON.parse(data.toString('utf-8'));
            for (let w of words_) {
              if (words.indexOf(w) == -1) {
                words.push(w);
              }
            }
            words.sort();
            fs.readFile('./repeatingWords.txt', function (err, data) {
              let words_ = JSON.parse(data.toString('utf-8'));
              for (let w of words_) {
                if (words.indexOf(w) == -1) {
                  repeatingWords.push(w);
                }
              }
              repeatingWords.sort();
              fs.writeFile('./repeatingWords.txt', JSON.stringify(repeatingWords), function (err) {
                if (err) {
                  console.log(err);
                } else {
                  fs.writeFile('./words.txt', JSON.stringify(words), function (err) {
                    if (err) {
                      console.log(err);
                    } else {
                      fs.writeFile('./nonRepeatingWords.txt', JSON.stringify(nonRepeatingWords), function (err) {
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
});

/* GET home page. */
router.get('/', function (req, res, next) {
  wordNumber = Math.floor((date - new Date("Mon Feb 21 2022 00:00:00 GMT+0400")) / 86400000)
  wordOfTheDay = swords[wordNumber].toUpperCase();
  res.render('index', { title: 'Բառուկ | Արևելահայերեն', word: wordOfTheDay, wordNumber });
});

router.get('/stats', function (req, res, next) {
  res.send(stats);
});

router.post('/win', function (req, res, next) {
  date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Yerevan" }));
  stats.push({ device: req.headers["user-agent"], history: req.body.history, word: req.body.word, date })
  fs.writeFile('./stats.txt', JSON.stringify(stats), function (err) {
    if (err) {
      console.log(err);
    } else {
      res.send('stats');
    }
  });
});
router.get('/checkWord/:word', function (req, res, next) {
  if (words.indexOf(req.params.word.toLowerCase()) == -1) {
    res.send(false);
    if (repeatingWords.indexOf(req.params.word.toLowerCase()) == -1) {
      repeatingWords.push(req.params.word.toLowerCase());
      fs.writeFile('./repeatingWords.txt', JSON.stringify(repeatingWords), function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  } else {
    res.send(true);
    if (nonRepeatingWords.indexOf(req.params.word.toLowerCase()) != -1) {
      nonRepeatingWords.splice(nonRepeatingWords.indexOf(req.params.word.toLowerCase()), 1);
      fs.writeFile('./nonRepeatingWords.txt', JSON.stringify(nonRepeatingWords), function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }
});

module.exports = router;
