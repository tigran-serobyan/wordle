var express = require('express');
var router = express.Router();
var fs = require('fs');
var words = [];
var date = new Date();
var _date = date.getDate();
var wordOfTheDay = '';
var wordNumber = 1;

fs.readFile('./words.txt', function (err, data) {
  let words_ = data.toString('utf-8').split('\r\n');
  for (let w of words_) {
    if (words.indexOf(w) == -1) {
      words.push(w);
    }
  };
  words.sort();
  wordOfTheDay = words[Math.ceil(Math.random() * (words.length - 1))].toUpperCase();
});

/* GET home page. */
router.get('/', function (req, res, next) {
  date = new Date();
  if (_date != date.getDate()) {
    _date = date.getDate();
    wordOfTheDay = words[Math.ceil(Math.random() * (words.length - 1))].toUpperCase();
    wordNumber++;
  }
  res.render('index', { title: 'ԲԱՌՈՒԿ', word: wordOfTheDay, words, wordNumber });
});

module.exports = router;
