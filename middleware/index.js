var campground = require("../models/campground");
var comment = require("../models/comment");

var middleware = {};

middleware.isLogin = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You Have To Login First");
	res.redirect("/login");
}

middleware.checkOwnership = function(req, res, next){
	campground.findById(req.params.id, function(err, foundcamp){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("back");
		}else{
			if(req.isAuthenticated() && foundcamp.author.id.equals(req.user._id)){
				next();
			}else{
				req.flash("error", "You Don't Have Permission To Do This");
				res.redirect("back");
			}
		}
	});
}

middleware.checkCommentOwner = function(req, res, next){
	comment.findById(req.params.comment_id, function(err, foundcomment){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("back");
		}else{
			if(req.isAuthenticated() && foundcomment.author.id.equals(req.user._id)){
				next();
			}else{
				req.flash("error", "You Don't Have Permission To Do This");
				res.redirect("back");
			}
		}
	});
}

module.exports = middleware;