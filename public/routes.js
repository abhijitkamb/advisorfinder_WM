//routes.js

//require('./public/passport.js')(passport);

module.exports = function (app, passport, path, LocalStrategy, bodyParser) {
	

	app.get('/login', function (req, res) {
		console.log("rendering login page");
		//console.log(__dirname );
		res.sendFile(path.join(__dirname + "/login.html"));
		//res.sendFile('./login.html');
	});

	app.post('/login', passport.authenticate('local', {
			successRedirect: '/loginSuccess',
			failureRedirect: '/loginFailure'
		})
	);


	app.get('/loginFailure', function (req, res, next){
		console.log("auth fail");
		res.send('Failed to authenticate');
	});

	app.get('/loginSuccess', function (req, res, next){
		console.log("auth pass");
		res.send('Sucessfully authenticated');
	});

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


}

