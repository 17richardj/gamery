var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var router = express.Router();

var User = require('../models/user');
var Scores = require('../models/score');
var Guests = require('../models/guest');
var db = require('../server');
var ssn;

router.get('/', function (req, res, next) {
	return res.render('landing.ejs');
});

router.post('/', function (req, res, next) {
	console.log('home');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){

			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});

			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			console.log("yikes");
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});
router.get('/register', function (req, res, next) {
	return res.render('index.ejs');
});


router.post('/register', function(req, res, next) {
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.phone){
		res.send();
	} else {
		if (personInfo.password) {

			User.findOne({email:personInfo.email},function(err,data){
				if(err) throw err;
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							//password: hash,
							phone: personInfo.phone
						});

 							User.create({
								unique_id:c,
								email:personInfo.email,
								username: personInfo.username,
								password: personInfo.password,
								phone: personInfo.phone
   }).then(function(data) {
    if (data) {
			ssn = req.session;
			ssn.tempId = newPerson.unique_id;
			hope(newPerson.unique_id);
			req.session.save(function (err) {
				if (err) {
					return next(err);
				} else {
					console.log('mula');
				}
			});
    console.log(req.session.tempId);
    }
  });


					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/welcome', function (req, res, next) {
	return res.render('welcome.ejs');
});

router.post('/welcome', function(req, res, next) {
	var test;
	function hope(id){
		test = id;
	}
	console.log("test" + test);
	ssn = req.session;
	var phoneInfo = req.body;
	console.log(phoneInfo.phone);

	if(!phoneInfo){
		res.send();
	} else {

		var query = {'unique_id': ssn.tempId};
		//req.newData.username = req.user.username;
		console.log(ssn.tempId);

		User.updateOne(query, {'phone': phoneInfo.phone}, {upsert: false}, function (err, result) {
			if(err) console.log(err);
			if(result){
				console.log(result)
				console.log(result);
			}else{
				console.log("failure");
			}
		});
		req.session.destroy(function (err) {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/login');
			}
		});
}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log('login');
		if(data){

			bcrypt.compare(req.body.password, data.password, function (err, result) {
			        if (result == true) {

								req.session.userId = data.unique_id;
								//console.log(req.session.userId);

			            res.send({"Success":"Success!"});
			        } else {
			         res.send({"Success":"Wrong password!"});
			        }
			      });
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/guest', function (req, res, next) {
	return res.render('guest.ejs');
});

router.post('/guest', function(req, res, next) {
	var guestInfo = req.body;

	if(!guestInfo.guest){
		res.send();
	} else {

			Guests.findOne({username:guestInfo.guest},function(err,data){
				console.log(" " + guestInfo.guest)
				if(!data){

						var random_id           = '';
				    var characters       = '0123456789';//'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
				    var charactersLength = characters.length;
				    for ( var i = 0; i < 15; i++ ) {
				       random_id += characters.charAt(Math.floor(Math.random() * charactersLength));
				    }

						var newGuest = new Guests({
							unique_id: random_id,
							username: guestInfo.guest
						});
						newGuest.save(function(err, Person){
							if(err)
								console.log(err);
							else
							req.session.userId = newGuest.unique_id;
								console.log('New Guest: ' + guestInfo.guest);
								//return res.redirect('/2048');
						});

					res.send({"Success":"Success!"});
				}else{
					res.send({"Success":"There is already an account with that name."});
				}

			});
	}
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	var blob = {};
	User.findOne({unique_id:req.session.userId},function(err, userData){
		if(!userData){
			console.log("none bro");
			res.redirect('/');
		}else{
			blob = {userData};
		}
});
Scores.find({unique_id: req.session.userId}).sort('-score')  // give me the max
	.exec(function (err, scoreData) {
		if(err){
			console.log(err);
		}
		// your callback code
//console.log(userData);
if(!scoreData){
	//res.redirect('/');
}else{
	var newBlob = {blob, scoreData};

	function isEmpty(scoreData) {
	  for(var prop in scoreData) {
	    if(scoreData.hasOwnProperty(prop)) {
	      return false;
	    }
	  }
		return true;
	}
	var list;
	if(isEmpty(scoreData)){
		list = 'No Data';
	}else{
		list = "<% scoreData.forEach(function(data) { %><tr class='col-sm-2'><td><%= data.game.game_name %></td><td><%= data.score %></td><td><%= data.created.getMonth()%>/<%= data.created.getDate() %></td><td><%= data.score %></td></tr><% }); %>";
	}
	console.log(list);
	return res.render('data.ejs', {"scoreData": newBlob.scoreData, "userData": newBlob.blob.userData, 'list': list});
}
});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});

});





router.post('/submitScore', function(req, res, next) {
	var pScore = req.body;
console.log(JSON.stringify(req.body));
			User.findOne({unique_id:req.session.userId},function(err,data){
				console.log(data);
				//if(!data){

				const name = process.env.GAME_NAME;

						var newScore = new Scores({
							_id: new mongoose.Types.ObjectId(),
							unique_id: data.unique_id,
							username: data.username,
							score: pScore.score,
							location: {
								city: pScore.city.toString(),
								state: pScore.state.toString(),
								country: pScore.country.toString()
							},
							game: {
								game_name: name,
								game_description: ""
							}
						});

						newScore.save(function(err, userScores){
							if(err)
								console.log(err);
							else
							console.log("Successfully: submitted Score" + newScore);
							//return res.redirect('/scoreboard');
						});

					res.send({"Success":"Your score was submitted"});


			});
});

router.get('/2048', function (req, res, next) {
	//res.sendFile(path.join(__dirname + '/2048-master/index.html'));
	res.render("2048/2048.ejs");
});

router.get('/scoreboard', function (req, res, next) {

	var loc = {};

	Scores.findOne({unique_id:req.session.userId},function(err,data){
		if(!data){
			res.send({"Failure":"Oops! Thats not supposed to happen! Hang with us while we try to solve your problem."});
		}else{
			loc.city = data.location.city;
			loc.state = data.location.state;
			loc.country = data.location.country;
		}
	});
	var bigBlob = {};
	Scores.find({city: loc.city}).sort({score: -1}).limit(10).exec(function(err,cityData) {
		bigBlob.cityData = cityData;
			 });
	Scores.find({state: loc.state}).sort({score: -1}).limit(10).exec(function(err,stateData) {
		bigBlob.stateData = stateData;
				});
	Scores.find({country: loc.country}).sort({score: -1}).limit(10).exec(function(err,countryData) {
		bigBlob.countryData = countryData
			return res.render('scoreboard.ejs', {'cityData': bigBlob.cityData, 'stateData': bigBlob.stateData, 'countryData': bigBlob.countryData});
			 	});
});




module.exports = router;
