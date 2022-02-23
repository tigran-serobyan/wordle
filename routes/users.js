var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  fs.readFile('./repeatingWords.txt', function (err, data) {
    let repeatingWords = JSON.parse(data.toString('utf-8')).join('\n');
    fs.readFile('./nonRepeatingWords.txt', function (err, data) {
      let nonRepeatingWords = JSON.parse(data.toString('utf-8')).join('\n');
      fs.readFile('./words.txt', function (err, data) {
        let words = JSON.parse(data.toString('utf-8')).join('\n');
        res.render('admin', { title: 'Բառուկ', words, nonRepeatingWords, repeatingWords });
      });
    });
  });
});

module.exports = router;
