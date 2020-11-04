var campground = require("../models/campground");
var comment = require("../models/comment");
var review = require("../models/review");

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
			if((req.isAuthenticated() && foundcamp.author.id.equals(req.user._id)) || req.user.isManager){
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
			if((req.isAuthenticated() && foundcomment.author.id.equals(req.user._id)) || req.user.isManager){
				next();
			}else{
				req.flash("error", "You Don't Have Permission To Do This");
				res.redirect("back");
			}
		}
	});
}

middleware.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        review.findById(req.params.review_id, function(err, foundReview){
            if(err){
                res.redirect("back");
            }  else {
                if(foundReview.author.id.equals(req.user._id) || req.user.isManager) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middleware.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/camp/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

module.exports = middleware;