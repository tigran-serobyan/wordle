var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var router = express.Router();
var http = require('http');
var fs = require('fs');
var words = [];
var repeatingWords = [];
var nonRepeatingWords = [];

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use('/', router);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

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

router.get('/', function (req, res, next) {
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


app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});