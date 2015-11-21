var express = require('express');
var app = express();

var mongojs = require('mongojs');
var db = mongojs('contactlist', ['contactlist']);


var bodyParser = require('body-parser');
var path = require("path");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//routes
//require('./public/passport.js')(passport, bodyParser);
//require('./public/routes.js')(app, passport, path, LocalStrategy, bodyParser);




var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MyDatabase');
var Schema = mongoose.Schema;
var UserDetail = new Schema({
	username: String,
	password: String
}, {
	collection: 'userInfo'
});

var UserDetails = mongoose.model('userInfo', UserDetail);
module.export = UserDetails;

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));





app.get('/contactlist', function (req, res){
	
	console.log("received get request");

	db.contactlist.find(function (err, docs) {
		console.log(docs);
		res.json(docs);
	});
});



app.post('/contactlist', function (req, res) {
	console.log(req.body);

	db.contactlist.insert(req.body, function (err, doc){
		res.json(doc);
	});
});

app.delete('/contactlist/:id', function (req, res){
	var id = req.params.id;
	console.log(id);

	db.contactlist.remove({_id: mongojs.ObjectId(id)}, function (err, doc){
		res.json(doc);
	})
});

app.get('/contactlist/:id', function (req, res){
	var id = req.params.id;
	console.log(id);
	db.contactlist.findOne({_id:mongojs.ObjectId(id)}, function (err, doc) {
		res.json(doc);
	})
});

app.put('/contactlist/:id', function (req, res) {
	var id = req.params.id;
	console.log(req.body.name);

	db.contactlist.findAndModify({query: {_id: mongojs.ObjectId(id)},
		update: {$set: {name: req.body.name, email: req.body.email, number: req.body.number}},
		new: true},
		function (err, doc){
			res.json(doc);
		}
	);
});

app.get('/login', function (req, res) {
	console.log("rendering login page");
	res.sendFile(path.join(__dirname + "/public" + '/login.html'));
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


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
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








//launch

var port = 3001

app.listen(port);
console.log("Server running on port "+ port);