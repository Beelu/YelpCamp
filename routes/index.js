var express = require("express");
var router = express.Router();
var passport = require("passport");
var user = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

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
router.post("/login", function (req, res, next) {
  passport.authenticate("local",
    {
      successRedirect: "/camp",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: "Welcome to YelpCamp, " + req.body.username + "!"
    })(req, res);
});

//登出
router.get("/logout", function(req, res){
	req.logout(),
	req.flash("success","Already log you out");
	res.redirect("/camp");
});

//忘記密碼頁面
router.get("/forgot", (req, res) => {
	res.render("forgot");
});

//忘記密碼後的寄信功能實作
router.post("/forgot", (req, res) => {
	async.waterfall([
		//第一步-先產生隨機token
		function(done){
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString('hex');		//對buf進行編碼產生token
				done(err, token);
			});
		},
		//第二步-找到該使用者並設定其token和過期時間
		function(token, done){
			user.findOne({email:req.body.email}, function(err, founduser){
				if(!founduser){
					req.flash("error", "error, no account with that email exists.");
					return res.redirect("forgot");
				}
				
				founduser.resetPWtoken = token;
				founduser.resetPWexpires = Date.now() + 3600000;  //1小時
				
				founduser.save((err) => {
					done(err, token, founduser);
				});
			});
		},//第三步-寄email
		function(token, founduser, done){
			var transport = nodemailer.createTransport({
				service:"Gmail",
				auth:{
					user: "gankgank8787@gmail.com",
					pass: process.env.appPW
				},
			});
			var content = {
				to: founduser.email,
				from: "gankgank8787@gmail.com",
				subject: "Reset Password From YelpCamp",
				text: "click the link below to reset you password.\n http://" + req.headers.host + "/reset/" + token
			}
			transport.sendMail(content, (err) => {
				req.flash("success", "email has been send to " + user.email + ", please check with further instruction.");
				done(err, "done");
			});
		},//最後的錯誤處理
		function(err){
			if(err) console.log(err);
			res.redirect("/forgot");
		}
	]);
});

//重設密碼頁面
router.get("/reset/:token", (req, res) => {
	user.findOne({resetPWtoken:req.params.token, resetPWexpires:{$gt:Date.now()}}, (err, founduser) => {	//$gt=greater than
		if(err){
			req.flash("error", "password reset token is invaild or expired.");
			return res.redirect("/forgot");
		}
		res.render("reset", {token:req.params.token});
	});
});

//重設密碼功能實作
router.post("/reset/:token", (req, res) => {
	user.findOne({resetPWtoken:req.params.token, resetPWexpires:{$gt:Date.now()}}, (err, founduser) => {
		if(err){
			req.flash("error", "password reset token is invaild or expired.");
			return res.redirect("back");
		}	
		if(req.body.password === req.body.confirm){
			founduser.setPassword(req.body.password, (err) => {
				if(err){
					req.flash("error", "Someting goes wrong! please try again!");
					return res.redirect("back");
				}
				founduser.resetPWtoken = undefined;
				founduser.resetPWexpires = undefined;
				
				founduser.save((err) => {
					req.logIn(founduser, (err) => {
						req.flash("success", "Password has been reset, automatic login.");
						res.redirect("/camp");
					});
				});
			});
		}else{
			req.flash("error", "Password doesn't match.");
			return res.redirect("back");
		}
	});
});


module.exports = router;