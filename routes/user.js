var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var user = require("../models/user");
var middleware = require("../middleware");

//個人資料顯示頁面-SHOW
router.get("/", middleware.isLogin, function(req, res){
	user.findById(req.params.user_id, function(err, founduser){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/camp");
		}else{
			res.render("user/show", {founduser:founduser});
		}
	});
});

//個人資料編輯頁面-EDIT
router.get("/edit", middleware.isLogin, function(req, res){
	user.findById(req.params.user_id, function(err, founduser){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/user/" + req.params.user_id);
		}else{
			res.render("user/edit", {founduser:founduser});
		}
	});
});

//個人資料編輯實作-UPDATE
router.put("/", middleware.isLogin, function(req, res){
	user.findByIdAndUpdate(req.params.user_id, req.body.user, function(err, updateuser){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/user/" + req.params.user_id);
		}else{
			res.redirect("/user/" + req.params.user_id);
		}
	})
})

module.exports = router;