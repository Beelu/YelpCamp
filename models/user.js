var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username:{type:String, unique:true, required: true},
	password: String,
	firstname: String,
	lastname: String,
	email: {type:String, unique:true, required: true},
	avatar: String,
	birthday: String,
	description: String,
	isManager:{type: Boolean, default: false},
	resetPWtoken: String,
	resetPWexpires: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);