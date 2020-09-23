var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
//for password hashing
var bcrypt = require('bcrypt');
const saltRounds = 10;

var router = express.Router();

//require models
var User = require('../models/user');
var Scores = require('../models/score');
var Guests = require('../models/guest');

//connect to server
var db = require('../server');
var ssn;

//renders the homepage
router.get('/', function (req, res, next) {
	return res.render('landing.ejs');
});

//function: post 
//controls session authentication
//version:
//author: Joshua Richard
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

//renders registering page
router.get('/register', function (req, res, next) {
	return res.render('index.ejs');
});

//endpoint: /register
//registers user
//version:
//author: Joshua Richard
router.post('/register', function(req, res, next) {
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password){
		res.send();
	} else {
		if (personInfo.password) {
			console.log(personInfo.username);

			//query db to check if a user already exists with this info details
			User.findOne({$or:[{email: personInfo.email},{username: personInfo.username}]},function(err,data){
				if(err) throw err;
				
				//if returned obj isn't empty
				if(!data){
					var c;
					
					//
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							
							//give a unique id
							c = data.unique_id + 1;
						}else{
							c=1;
						}
						
						//create object of new user
						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							//password: hash,
							phone: personInfo.phone
						});
						
						//create new user in db
 							User.create({
								unique_id:c,
								email:personInfo.email,
								username: personInfo.username,
								password: personInfo.password,
								phone: personInfo.phone
   }).then(function(data) {
		 if (err) {
				return next(err);
			} else {
				if (data) {
					console.log("New user: " + data);
				}
			}
  });


					}).sort({_id: -1}).limit(1);
					//if successful send success message
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					//else return failed message
					res.send({"Success":"Email or username is already used."});
				}

			});
		}else{
			//return error message
			res.send({"Success":"password is not matched"});
		}
	}
});

//render welcome message @endpoint: /welcome
router.get('/welcome', function (req, res, next) {
	return res.render('welcome.ejs');
});

//render login page @endpoint: /login
router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

//endpoint: /login
//logs user in and establishes secure session
//author Joshua Richard
router.post('/login', function (req, res, next) {
	//console.log(req.body);
	
	//make sure there is a user registered at specified email
	User.findOne({email:req.body.email},function(err,data){
		console.log('login');
		if(data){
			
			//use bcrypt to compare hash and inputed password
			bcrypt.compare(req.body.password, data.password, function (err, result) {
			        if (result == true) {

								req.session.userId = data.unique_id;
								//console.log(req.session.userId);

			            res.send({"Success":"Success!"});	//success
			        } else {
			         res.send({"Success":"Wrong password!"});	//failure
			        }
			      });
		}else{
			res.send({"Success":"This Email Is not regestered!"});	//failure
		}
	});
});

//renders guest input page @endpoint: /guest
router.get('/guest', function (req, res, next) {
	return res.render('guest.ejs');
});

//endpoint: /guest
//stores guest details
//author: Joshua Richard
router.post('/guest', function(req, res, next) {
	var guestInfo = req.body;

	if(!guestInfo.guest){
		res.send();
	} else {
			//make sure guest name is not already in use
			Guests.findOne({username:guestInfo.guest},function(err,data){
				console.log(" " + guestInfo.guest)
				if(!data){
					
						var random_id           = '';
				    var characters       = '0123456789';//'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
				    var charactersLength = characters.length;
				    for ( var i = 0; i < 15; i++ ) {
					//generates random number for id
				       random_id += characters.charAt(Math.floor(Math.random() * charactersLength));
				    }
						//new guest object with guest details
						var newGuest = new Guests({
							unique_id: random_id,
							username: guestInfo.guest
						});
						
						//saves guest details to database
						newGuest.save(function(err, Person){
							if(err)
								console.log(err);
							else
								
							//starts a session with new guest id
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

//endpoint: /profile
//gets user profile details for profile page
//author: Joshua Richard
router.get('/profile', function (req, res, next) {
	console.log("profile");
	var blob = {};
	
	//find user details by session id
	User.findOne({unique_id:req.session.userId},function(err, userData){
		if(!userData){
			console.log("none bro");
			res.redirect('/');
		}else{
			blob = {userData};
		}
});

//find user scores by session id
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

	//check if returned object is empty or not
	function isEmpty(scoreData) {
	  for(var prop in scoreData) {
	    if(scoreData.hasOwnProperty(prop)) {
	      return false;
	    }
	  }
		return true;
	}
	var list;

	//if empty return no data
	if(isEmpty(scoreData)){
		list = 'No Data';
	}else{
		//return info
		list = "<% scoreData.forEach(function(data) { %><tr class='col-sm-2'><td><%= data.game.game_name %></td><td><%= data.score %></td><td><%= data.created.getMonth()%>/<%= data.created.getDate() %></td><td><%= data.score %></td></tr><% }); %>";
	}
	console.log(list);
	
	//render the profile page with the accessed data
	return res.render('data.ejs', {"scoreData": newBlob.scoreData, "userData": newBlob.blob.userData, 'list': list});
}
});
});

//@endpoint: /logout , ends session and destroys session variables
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

//renders forgetpassword page @endpoint: /forgetpass
router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

//endpoint: /forgetpass
//allows user to create new password
//author: Joshua Richard
router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	
	//find user where email exists
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
					res.send({"Success":"Password changed!"});	//success
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});	//failure
		}
		}
	});

});




//endpoint: /submitScore
//submits user or guest scores to the scores table
//author: Joshua Richard
router.post('/submitScore', function(req, res, next) {
	var pScore = req.body;
console.log(JSON.stringify(req.body));
			User.findOne({unique_id:req.session.userId},function(err,data){
				console.log(data);
				//if(!data){

				const name = process.env.GAME_NAME;
						
						// new score object with score and user/guest details
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
						
						//saves new score to db
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

//renders game 2048 @endpoint: /2048
//game rendering can vary
router.get('/2048', function (req, res, next) {
	//res.sendFile(path.join(__dirname + '/2048-master/index.html'));
	res.render("2048/2048.ejs");
});

//endpoint: /scoreboard
//renders scoreboard page with all user and guest best scores by location
//author: Joshua Richard
router.get('/scoreboard', function (req, res, next) {

	var loc = {};

	Scores.findOne({unique_id:req.session.userId},function(err,data){
		if(!data){
			//res.send({"Failure":"Oops! Thats not supposed to happen! Hang with us while we try to solve your problem."});
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
