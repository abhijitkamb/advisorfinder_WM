//passport.js


//var LocalStrategy = require('passport-local').Strategy;

var UserDetails = require('../server');



module.exports = function(passport, bodyParser){

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

/*
	passport.use(new LocalStrategy(function (username, password, done) {

		console.log("username  " + username + "  pass   " + password);

		//process.nextTick(function () {
			UserDetails.findOne({'username': username}, function (err, user) {
				if (err)
					return done(err);

				if(!user)
					return done(null, false);

				if(user.password != password)
					return done(null, false);
				
				return done(null, user);
			});
		//});
	}));
*/

}






