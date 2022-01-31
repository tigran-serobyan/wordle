var express = require('express');
var router = express.Router();
var fs = require('fs');
var words = [];
var repeatingWords = [];
var nonRepeatingWords = [];
var date = new Date();
var _date = date.getDate();
var wordOfTheDay = '';
var wordNumber = 1;

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

/* GET home page. */
router.get('/', function (req, res, next) {
  date = new Date();
  if (_date != date.getDate()) {
    _date = date.getDate();
  }
  console.log(nonRepeatingWords[0].split('n'));
  for (let i = 0; i < nonRepeatingWords[0].split('n').length; i++) {
    const element = nonRepeatingWords[0].split('n')[i];
    console.log(i, element);    
  }
  wordOfTheDay = nonRepeatingWords[0][Math.ceil(Math.random() * (nonRepeatingWords[0].length - 1))];
  wordNumber++;
  res.render('index', { title: 'ԲԱՌՈՒԿ', word: wordOfTheDay, wordNumber });
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
