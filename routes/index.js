var express = require("express");
var router = express.Router();
var passport = require("passport");
var user = require("../models/user");

//主頁面
router.get("/", function(req, res){
	res.render("landing");
});

//===============authenticate route==================
//註冊
router.get("/register", function(req, res){
	res.render("register");
});

//註冊實作
router.post("/register", function(req, res){
	var newuser = new user({username: req.body.username});
	user.register(newuser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Sign Up Sucess, Welcome " + req.user.username);
			res.redirect("/camp");
		});
	});
});

//登入頁面
router.get("/login", function(req, res){
	res.render("login");
});

//登入實作
router.post("/login", passport.authenticate("local", {
	successRedirect: "/camp",
	failureRedirect: "/login"
	}), function(req, res){
		req.flash("success", "Welcome To YelpCamp " + req.user.username);
	});

//登出
router.get("/logout", function(req, res){
	req.logout(),
	req.flash("success","Already log you out");
	res.redirect("/camp");
});

module.exports = router;