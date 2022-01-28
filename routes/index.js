var express = require('express');
var router = express.Router();
var fs = require('fs');
var words = [];
var repeatingWords = [];
var nonRepeatingWords = [];
var date = new Date();
var _date = date.getUTCDay();
var wordOfTheDay = '';

fs.readFile('./words.txt', function (err, data) {
  let words_ = data.toString().split('\r\n');
  for (let w of words_) {
    if (words.indexOf(w) == -1) {
      words.push(w);
    }
  }
  wordOfTheDay = words[Math.floor(Math.random() * words.length)].toUpperCase();
  fs.writeFile('./words.txt', words.join('\r\n'), function (err) {
    if (err) {
      console.log(err);
    }
  });
});

fs.readFile('./repeatingWords.txt', function (err, data) {
  let words_ = data.toString().split('\r\n');
  for (let w of words_) {
    repeatingWords.push(w);
  }
});

fs.readFile('./nonRepeatingWords.txt', function (err, data) {
  let words_ = data.toString().split('\r\n');
  for (let w of words_) {
    nonRepeatingWords.push(w);
  }
  fs.readFile('./words.txt', function (err, data) {
    let words_ = data.toString().split('\r\n');
    for (let w of words_) {
      if (words.indexOf(w) == -1) {
        words.push(w);
      }
      if (nonRepeatingWords.indexOf(w) == -1) {
        nonRepeatingWords.push(w);
      }
    }
    wordOfTheDay = words[Math.floor(Math.random() * words.length)].toUpperCase();
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
  });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  if (_date != date.getUTCDay()) {
    _date = date.getUTCDay();
    wordOfTheDay = words[Math.floor(Math.random() * words.length)].toUpperCase();
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
