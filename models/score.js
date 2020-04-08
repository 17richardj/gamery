var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var User = require('../models/user');

var Schema = mongoose.Schema;

var score = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	unique_id: Number,
	username: String,
	score: Number,
	location: {
		city: String,
		state: String,
	  country: String
	},
	game: {
		game_name: String,
		description: String
	},
    created: {
        type: Date,
        default: Date.now
    }
}),
Scores = mongoose.model('Scores', score);

module.exports = Scores;
