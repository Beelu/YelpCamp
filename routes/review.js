var express = require("express");
var router = express.Router({mergeParams: true});
var campground = require("../models/campground");
var review = require("../models/review");
var middleware = require("../middleware");

//Create
router.post("/", middleware.isLogin, middleware.checkReviewExistence, function (req, res) {
    campground.findById(req.params.id).populate("reviews").exec(function (err, foundcamp) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        review.create(req.body.review, function (err, newreview) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            newreview.author.id = req.user._id;
            newreview.author.username = req.user.username;
            newreview.campground = foundcamp;
            newreview.save();
			
            foundcamp.reviews.push(newreview);
           	foundcamp.rating = average(foundcamp.reviews);
            foundcamp.save();
			
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/camp/' + foundcamp._id);
        });
    });
});

//Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, 
		{new: true}).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            campground.rating = average(campground.reviews);
            campground.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/camp/" + req.params.id);
        });
    });
});

//算平均
function average(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;