var router = require('express').Router();
var async = require('async');
var Dvd = require('../models/dvd');



router.post('/search', function(req, res, next) {
  console.log(req.body.search_term);
  Dvd.search({
    query_string: { query: req.body.search_term }
  }, function(err, results) {
    if (err) return next(err);
    res.json(results);
  });
});

module.exports = router;