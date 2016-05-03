var router = require('express').Router();
var User = require('../models/user');
var Dvd = require('../models/dvd');
var Cart = require('../models/cart');

var async = require('async');

var stripe = require('stripe') ('sk_test_sV7VlmmKn0J61coVSOinNP0d');

// pagination
function paginate(req, res, next) {

  var perPage = 9;
  var page = req.params.page;

  Dvd
    .find()
    .skip( perPage * page)
    .limit( perPage )
    .exec(function(err, dvds) {
      if (err) return next(err);
      Dvd.count().exec(function(err, count) {
        if (err) return next(err);
        res.render('main/movie-main', {
          dvds: dvds,
          pages: count / perPage
        });
      });
    });

}


//create connection between Dvd model in database and elsaticsearch replica set
Dvd.createMapping(function(err, mapping) {
  if (err) {
    console.log("error creating mapping");
    console.log(err);
  } else {
    console.log("Mapping created");
    console.log(mapping);
  }
});

//synchronise all dvd in elasticsearch (replicate all data and put in in elasticsearch)
var stream = Dvd.synchronize();
var count = 0;
//run 3 different event driven method
//count document 
stream.on('data', function() {
  count++;
});
//when close synchronise method show count od all data
stream.on('close', function() {
  console.log("Indexed " + count + " documents");
});
//swho error to the user
stream.on('error', function(err) {
  console.log(err);
});

router.get('/cart', function(req, res, next) {
  Cart
    .findOne({ owner: req.user._id })
    .populate('items.item')
    .exec(function(err, foundCart) {
     if (err) return next(err);
      res.render('main/cart', {
        foundCart: foundCart,
        message: req.flash('remove')
      });
    });
});

router.post('/movie/:dvd_id', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, cart) {
    cart.items.push({
      item: req.body.dvd_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });

    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save(function(err) {
      if (err) return next(err);
      return res.redirect('/cart');
    });
  });
});


router.post('/remove', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found) {
      if (err) return next(err);
      req.flash('remove', 'Successfully removed');
      res.redirect('/cart');
    });
  });
});



//adding elasticsearch feature

router.post('/search', function(req, res, next) {
	//redirect user to search route with extra parameter 
	// req.body.q has your search term, depends on the input name on the html.
  res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req, res, next) {
  if (req.query.q) {
	  //elasticsearch methods
    Dvd.search({
		//search elasticsearch replica set
      query_string: { query: req.query.q}
    }, function(err, results) {
      results:
      if (err) return next(err);
	  //result is nested  hits hits object
	  //want value inside second hits object and we use js built-in function .map
      var data = results.hits.hits.map(function(hit) {
        return hit;
      });
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
    });
  }
});




//

router.get('/', function(req, res, next) {
 if (req.user) {
	 //implement pagination
    paginate(req, res, next);
  } else {
    res.render('main/home');
  }
});

router.get('/about', function(req, res) {
  res.render('main/about');
});

router.get('/page/:page', function(req, res, next) {
  paginate(req, res, next);
});



router.get('/movies', function(req, res, next) {
Dvd.find({}, function( err, dvds){
			if(err) return next (err);
			res.render('main/movies', {
				dvds:dvds
			});
			});
		});       
		
/*router.get('/movies/:ganre', function(req, res, next) {
Dvd.find({dvd:req.params.ganre}, function( err, dvds){
			if(err) return next (err);
			res.render('main/movies', {
				dvds:dvds
			});
			});
		});       
	*/

router.get('/movie/:id', function(req, res, next) {
Dvd.findById({_id:req.params.id}, function(err, dvd){
			if(err) return next (err);
			res.render('main/movie', {
				dvd:dvd
			});
			});		
			
		});      

		
		
router.post('/payment', function(req, res, next) {

  var stripeToken = req.body.stripeToken;
  
  //stripe charge in cents - must multiple with 100
  var currentCharges = Math.round(req.body.stripeMoney * 100);
  stripe.customers.create({
    source: stripeToken,
  }).then(function(customer) {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'rsd',
      customer: customer.id
    });
  }).then(function(charge) {
    async.waterfall([
      function(callback) {
        Cart.findOne({ owner: req.user._id }, function(err, cart) {
          callback(err, cart);
        });
      },
      function(cart, callback) {
        User.findOne({ _id: req.user._id }, function(err, user) {
          if (user) {
            for (var i = 0; i < cart.items.length; i++) {
              user.history.push({
                item: cart.items[i].item,
                paid: cart.items[i].price
              });
            }

            user.save(function(err, user) {
              if (err) return next(err);
              callback(err, user);
            });
          }
        });
      },
      function(user) {
        Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function(err, updated) {
          if (updated) {
            res.redirect('/profile');
          }
        });
      }
    ]);
  });


});		
		

module.exports = router;
