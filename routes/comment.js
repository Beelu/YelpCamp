var express = require("express");
var router = express.Router({mergeParams: true});
var campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");

//新增評論-NEW
router.get("/new", middleware.isLogin, function(req, res){
	campground.findById(req.params.id, function(err, foundcamp){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			res.render("comment/new", {foundcamp:foundcamp});			
		}
	});
});

//新增評論實作-CREATE
router.post("/", middleware.isLogin, function(req, res){
	campground.findById(req.params.id, function(err, foundcamp){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			comment.create({text:req.body.text}, function(err, newcomment){
				if(err){
					console.log(err);
				}else{
					newcomment.author.id = req.user._id;
					newcomment.author.username = req.user.username;
					newcomment.save();
					foundcamp.comments.push(newcomment);
					foundcamp.save();
					req.flash("success", "Comment has been created");
					res.redirect("/camp/" + foundcamp._id);
				}
			});
		}
	});
});

//編輯評論-EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwner, function(req, res){
	comment.findById(req.params.comment_id, function(err, foundcomment){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			res.render("comment/edit", {camp_id:req.params.id, foundcomment:foundcomment});
		}
	});
});

//編輯評論實作-UPDATE
router.put("/:comment_id", middleware.checkCommentOwner, function(req, res){
	comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, newcomment){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			req.flash("success", "Comment has been updated");
			res.redirect("/camp/" + req.params.id);
		}
	});
});

//刪除評論功能實作-DESTROY
router.delete("/:comment_id", middleware.checkCommentOwner, function(req, res){
	comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			req.flash("success", "Comment has been deleted");
			res.redirect("/camp/" + req.params.id);
		}
	})
})

module.exports = router;