var router = require('express').Router();
var Dvd = require('../models/dvd');
var passportConf = require('../config/passport');

router.get('/add-movie', passportConf.isAuthenticated, function(req, res, next) {
  res.render('admin/add-movie', { message: req.flash('success') });
});


router.post('/add-movie', passportConf.isAuthenticated, function(req, res, next) {
  var dvd = new Dvd();
  dvd.name = req.body.name;
  dvd.ganre= req.body.ganre;
  dvd.director= req.body.director;
  dvd.year= req.body.year;
  dvd.price= req.body.price;
  dvd.image= req.body.image;
  
  

  dvd.save(function(err) {
    if (err) return next(err);
    req.flash('success', 'Successfully added a movie');
    return res.redirect('/admin' );
  });
})

router.get('/admin', function(req, res, next) {
  res.render('admin/main'  );
});

router.get('/edit-movie/:id', passportConf.isAuthenticated, function(req, res, next) {
Dvd.findOne({_id:req.params.id}, function(err, dvd){
			if(err) return next (err);
			res.render('admin/edit-movie',
			{dvd:dvd} );		
			
		})
		});

router.post('/edit-movie/:id', passportConf.isAuthenticated, function(req, res, next) {
  
  var name = req.body.name;
  var ganre= req.body.ganre;
var director= req.body.director;
  var year= req.body.year;
  var price= req.body.price;
  var image= req.body.image;
  
  var query = {_id: req.params.id};
  
  var update = {
	  
	  name:name,
	  ganre:ganre,
	  director:director,
	  year:year,
	  price:price,
	  image:image,
	 
	 
  };
  

  Dvd.update(query, update, function(err) {
    if (err) return next(err);
    req.flash('success', 'Successfully edit a movie');
    return res.redirect('/admin');
  });
});

router.get('/admin', function(req, res, next) {
  res.render('admin/main' );
});

router.delete('/delete-movie/:id' , function(req, res, next){
			var query = {_id: req.params.id};
			Dvd.remove(query, function(err){
			if (err) return next(err);
			res.status(204).send();
			});
			
			
		});




module.exports = router;