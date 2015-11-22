var express = require('express');
var app = express();

var mongojs = require('mongojs');
var db = mongojs('contactlist', ['contactlist']);


var bodyParser = require('body-parser');
var path = require("path");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var lupus = require('lupus');
var sleep = require('sleep');
//routes
//require('./public/passport.js')(passport, bodyParser);
//require('./public/routes.js')(app, passport, path, LocalStrategy, bodyParser);




var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MyDatabase');
mongoose.set('debug', true)

var Schema = mongoose.Schema;
var UserDetail = new Schema({
	username: String,
	password: String
}, {
	collection: 'userInfo'
});

var questionschema = new Schema({
	sectionname: String,
	sectionid: String,
	content: String,
	options: [String],
	qlist:{
		type:Array,
		'default': []
	},
	alist:{
		type:Array,
		'default': []
	},
	priority: Number
}, { collection: 'questionInfo'});


var advisorschema = new Schema({
	name: String,
	sections: {
		type: Array,
		'default': []
	}
}, {collection: 'advisorInfo'});

var UserDetails = mongoose.model('userInfo', UserDetail);
module.export = UserDetails;

var QuestionDetails = mongoose.model('questionInfo', questionschema);
module.export = QuestionDetails;

var AdvisorDetails = mongoose.model('advisorInfo', advisorschema);
module.export = AdvisorDetails;



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
		//console.log(docs);
		res.json(docs);
	});
});

app.get('/questionlist', function (req, res) {
	console.log("received questionlist get request");

	QuestionDetails.find({}, function (err, docs) {
		//console.log(docs);
		res.json(docs);
	});
});


app.get('/intro', function (req, res) {
	console.log("received intro get request");
	res.sendFile(path.join(__dirname + "/public" + '/intro.html'));
	//res.sendFile(path.join(__dirname + "/public" + '/mainpage.html'));

	
});
app.post('/results', function (req, res) {
	console.log("SERRRRVERER CAN YOU SEE ME?????")
	console.log(path.join(__dirname, "public", "results.html"));
	//res.sendFile(path.join(__dirname, "public", "results.html"));
	//res.sendFile('public/results.html' , { root : __dirname});
	res = req;
});

app.post('/sendquestionnaire', function (req, res) {
	//console.log("PRIOIOOIAIdlksajjlasdkjadjkkj")
	//console.log(req.body.priority);
	//sectionid: "1"
	//value1: "1-0"
	//value2: "2-3"

	var valueIndex1 = Number(req.body.value1.split("-")[1]);
	var valueIndex2 = Number(req.body.value2.split("-")[1]);
	var optionIndex1 = Number(req.body.value1.split("-")[0])-1;
	var optionIndex2 = Number(req.body.value2.split("-")[0])-1;
	var findArrayResult = [];

//, {"qlist.options": 1} "sectionid":req.body.sectionid

	QuestionDetails.find({"sectionid":req.body.sectionid}, {"qlist.options":1} ,function (err, docs){

		console.log("DOCS");
		console.log(docs)
		var aa =JSON.stringify(docs[0]);

		bb = JSON.parse(aa);

		var ans1 = bb["qlist"][optionIndex1]["options"][valueIndex1];
		var ans2 = bb["qlist"][optionIndex2]["options"][valueIndex2];
		console.log("ANSERS")
		console.log(ans1);
		console.log(ans2);

		var score = 0;
		switch(req.body.priority){
			case 'Very_Important': 
				score = 100;
				break;
			case 'Important':
			 	score = 50;
			 	break;
			case 'Average': 
				score = 10;
				break;
			case 'Least_Important': 
				score = 1;
				break;
			default:
				score = 1;

		}


		QuestionDetails.update({"sectionid": String(req.body.sectionid)}, {$set:{"priority":score, "alist": [{"id":"1", "ans":String(ans1)},{"id":"2", "ans":String(ans2)}]}} , function (err, docs) {
			console.log(docs);
			res.json(docs);
		});

	});

});	

app.get('/matched', function (req, res) {
	console.log("processing matching making");

	var final_scores = [];

	var sections = ["1", "2", "3"]
	var advisors = {

	};

	var advisor = {
		"section": {
			"1": "",
			"2": "",
			"3": ""
		},
		"totalscore": ""
	};

	console.log("getting client names");

		lupus(0, sections.length, function(i) {
			QuestionDetails.find({"sectionid":sections[i]}, {"alist":1, "priority":1},  function (err, docs) {
				//console.log(docs[0]);

				var client = {
					"section" : sections[i],
					"priority" : docs[0].priority,
					"ans1" : docs[0].alist[0].ans,
					"ans2" : docs[0].alist[1].ans
				};

				//console.log(client);
				//clientinfolist.push(client);

				AdvisorDetails.find({"sections.sectionid": sections[i]}, {"sections.$.alist": 1, "name": 1},function (err, docs) {
					// console.log('---------------------------------');
					// console.log(docs);
					// console.log('---------------------------------');

					for(var j in docs){

						if(advisors[docs[j].name]==null || advisors[docs[j].name] == ""){
							advisors[docs[j].name] = {};
						}
						if(advisors[docs[j].name]["sections"] == null || advisors[docs[j].name]["sections"] == ""){
							advisors[docs[j].name]["sections"] = {};
						}

						advisors[docs[j].name]["sections"]["section_"+String(i+1)] = {};


						// console.log('---------------------------------');
						// console.log(docs[j]);
						// console.log('---------------------------------');
						advisors[docs[j].name]["sections"]["section_"+String(i+1)]["c_denom"]= Number(client.priority)*2; 
						advisors[docs[j].name]["sections"]["section_"+String(i+1)]["a_denom"]= Number(docs[j].sections[0].priority)*2; 

						if(client.ans1 == docs[j].sections[0].alist[0].ans){
							advisors[docs[j].name]["sections"]["section_"+String(i+1)]["c_numer"] = Number(client.priority);
							advisors[docs[j].name]["sections"]["section_"+String(i+1)]["a_numer"] = Number(docs[j].sections[0].priority);
						}
						else{
							advisors[docs[j].name]["sections"]["section_"+String(i+1)]["c_numer"] = 0;
							advisors[docs[j].name]["sections"]["section_"+String(i+1)]["a_numer"] = 0;
						}
							

						if(client.ans2 == docs[j].sections[0].alist[1].ans){

							advisors[docs[j].name]["sections"]["section_"+String(i+1)]["c_numer"] += Number(client.priority);
							advisors[docs[j].name]["sections"]["section_"+String(i+1)]["a_numer"] += Number(docs[j].sections[0].priority);
						}
						else{
							advisors[docs[j].name]["sections"]["section_"+String(i+1)]["c_numer"] += 0;
							advisors[docs[j].name]["sections"]["section_"+String(i+1)]["a_numer"] += 0;
						}


					}

				});


			});

			
					setTimeout(function() {
	  					if( i == sections.length -1){
							var addkeys = Object.keys(advisors);
							for ( var j in addkeys){
								/*console.log(advisors[addkeys[j]]["sections"]["section_1"]["a_numer"]);
								console.log(advisors[addkeys[j]]["sections"]["section_1"]["a_denom"]);
								console.log(advisors[addkeys[j]]["sections"]["section_2"]["a_numer"]);
								console.log(advisors[addkeys[j]]["sections"]["section_2"]["a_denom"]);
								console.log(advisors[addkeys[j]]["sections"]["section_3"]["a_numer"]);
								console.log(advisors[addkeys[j]]["sections"]["section_3"]["a_denom"]);
								console.log("------------------------------------------------------------------------------");*/
								advisors[addkeys[j]]["totalscore_c"] = (advisors[addkeys[j]]["sections"]["section_1"]["c_numer"] + advisors[addkeys[j]]["sections"]["section_2"]["c_numer"] +advisors[addkeys[j]]["sections"]["section_3"]["c_numer"])/(advisors[addkeys[j]]["sections"]["section_1"]["c_denom"] + advisors[addkeys[j]]["sections"]["section_2"]["c_denom"] +advisors[addkeys[j]]["sections"]["section_3"]["c_denom"]);
								advisors[addkeys[j]]["totalscore_a"] = (advisors[addkeys[j]]["sections"]["section_1"]["a_numer"] + advisors[addkeys[j]]["sections"]["section_2"]["a_numer"] +advisors[addkeys[j]]["sections"]["section_3"]["a_numer"])/(advisors[addkeys[j]]["sections"]["section_1"]["a_denom"] + advisors[addkeys[j]]["sections"]["section_2"]["a_denom"] +advisors[addkeys[j]]["sections"]["section_3"]["a_denom"]);
								advisors[addkeys[j]]["totalscore_final"] = Math.sqrt(advisors[addkeys[j]]["totalscore_c"]*advisors[addkeys[j]]["totalscore_a"] );
								console.log(advisors[addkeys[j]]);
								console.log(advisors[addkeys[j]]["totalscore_final"]);
								//console.log(advisors[addkeys[j]]["totalscore_c"]);
								//console.log(advisors[addkeys[j]]["totalscore_a"]);
							}

							var first = Number(advisors[addkeys[0]]["totalscore_final"]);
							var firstName = addkeys[0];
						
							for (var j in addkeys){
								var thisVal = Number(advisors[addkeys[j]]["totalscore_final"]);
								if(thisVal > first){
									first = thisVal;
									firstName = addkeys[j];
								}
								
							}

							var second = Number(advisors[addkeys[0]]["totalscore_final"]);
							var secondName = addkeys[0];

							if(secondName == firstName){
								var second = Number(advisors[addkeys[1]]["totalscore_final"]);
								var secondName = addkeys[1];
							}

							for (var j in addkeys){
								var thisVal = Number(advisors[addkeys[j]]["totalscore_final"]);
								if(thisVal > second && addkeys[j] != firstName ){
									second = thisVal;
									secondName = addkeys[j];
								}
								
							}

							var third = Number(advisors[addkeys[0]]["totalscore_final"]);
							var thirdName = addkeys[0];
							if(thirdName == firstName){
								third = Number(advisors[addkeys[1]]["totalscore_final"]);
								var thirdName = addkeys[1];
							}
							if(thirdName == secondName){

								third = Number(advisors[addkeys[2]]["totalscore_final"]);
								var thirdName = addkeys[2];
							}

							for (var j in addkeys){
								var thisVal = Number(advisors[addkeys[j]]["totalscore_final"]);
								if(thisVal > third && addkeys[j] != secondName && addkeys[j] != firstName){
									third = thisVal;
									thirdName = addkeys[j];
								}
								
							}

							var tops = [{name: firstName, value: first.toFixed(3)}, {name:secondName, value:second.toFixed(3)}, {name:thirdName, value:third.toFixed(3)}]
							console.log(tops);
							res.json(tops);

							return;
	  					}
					}, 1000);
					

				
		}, function() {
	  		console.log('All done!');
		});

	/*for(var i in sections){
		QuestionDetails.find({"sections.sectionid":sections[i], name}, {"sectalist":1, "priority":1},  function (err, docs) {
			console.log(docs);




		});
	}*/


		




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

app.get('/mainpage', function (req, res) {
	console.log("rendering main page");
	res.sendFile(path.join(__dirname + "/public" + '/mainpage.html'));
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
	//res.send('Sucessfully authenticated');
	//res.sendFile(path.join(__dirname + "/public" + '/mainpage.html'));
	res.sendFile(path.join(__dirname + "/public" + '/intro.html'));

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