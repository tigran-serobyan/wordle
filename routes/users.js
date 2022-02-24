var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  fs.readFile('./repeatingWords.txt', function (err, data) {
    let repeatingWords = JSON.parse(data.toString('utf-8')).join('\n');
    fs.readFile('./nonRepeatingWords.txt', function (err, data) {
      let nonRepeatingWords = data.toString('utf-8');
      fs.readFile('./words.txt', function (err, data) {
        let words = data.toString('utf-8');
        res.render('admin', { title: 'Բառուկ', words, nonRepeatingWords, repeatingWords });
      });
    });
  });
});

module.exports = router;
