var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

var Schema = mongoose.Schema;

guestSchema = new Schema( {

	unique_id: Number,
	username: String
}),
Guests = mongoose.model('Guests', guestSchema);

module.exports = Guests;
