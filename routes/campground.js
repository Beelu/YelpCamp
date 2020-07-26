var express = require("express");
var router = express.Router();
var campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");		//by default會自動找到index

//主資訊頁面-INDEX
router.get("/", function(req, res){
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		campground.find({name: regex}, function(err, camps){
			if(err){
				req.flash("error", "Something Get Wrong!");
				res.redirect("/camp");
			}else{
				res.render("campground/index",{camps:camps});
			}
		});
	}else{
		campground.find({}, function(err, camps){
			if(err){
				req.flash("error", "Something Get Wrong!");
				res.redirect("/camp");
			}else{
				res.render("campground/index",{camps:camps});
			}
		});
	}
});

//新增資訊實作-CREATE
router.post("/", middleware.isLogin, function(req, res){
	var author = {id: req.user._id, username: req.user.username};
	var newcamp = {
		name:req.body.name, price:req.body.price, img:req.body.img, description:req.body.description, author: author};
	campground.create(newcamp, function(err, newcampground){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			req.flash("success", "Campground has been created");
			res.redirect("/camp");
		}
	});
});

//新增資訊頁面-NEW
router.get("/new", middleware.isLogin, function(req, res){
	res.render("campground/new");
});

//詳細資訊頁面-SHOW
router.get("/:id", function(req,res){
	campground.findById(req.params.id).populate("comments").exec(function(err, foundcamp){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			res.render("campground/show", {foundcamp:foundcamp});
		}
	});
});

//編輯頁面-EDIT
router.get("/:id/edit", middleware.checkOwnership, function(req, res){
	campground.findById(req.params.id, function(err, foundcamp){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			res.render("campground/edit", {foundcamp:foundcamp});
		}
	});
});

//編輯功能實作-UPDATE
router.put("/:id", middleware.checkOwnership, function(req, res){
	campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatecamp){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			req.flash("success", "Campground has been updated");
			res.redirect("/camp/" + req.params.id);
		}
	});
});

//刪除功能實作-DESTROY(連帶刪除comment)
router.delete("/:id", middleware.checkOwnership, function(req, res){
	campground.findByIdAndRemove(req.params.id, function(err, removecamp){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			 comment.deleteMany( {_id: { $in: removecamp.comments } }, (err) => {
				if (err) {
					console.log(err);
				}else{
					req.flash("success", "Campground has been deleted");
					res.redirect("/camp");
				}
        	});
		}
	});
});

//防止有人惡意搜尋大量字串導致伺服器當機
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;