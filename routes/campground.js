var express = require("express");
var router = express.Router();
var campground = require("../models/campground");
var comment = require("../models/comment");
var review = require("../models/review");
var middleware = require("../middleware");		//by default會自動找到index

//使用multer上傳
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);			//檔名設定為現在時間+副檔名
  }
});
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);		//cb=callback 第二個參數為true才接收
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter, limit:{fileSize: 4000000}});		//對multer進行設定

//連接到cloudinary-圖片資料庫
var cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: 'dsgswaiyg', 
  api_key: '189818891664588', 
  api_secret: process.env.APIsecret
});

//======================================================================================================
//主資訊頁面-INDEX
router.get("/", function(req, res){
	var perPage = 8;
	if(req.query.page){
		var pageNum = parseInt(req.query.page);
	}else{
		var pageNum = 1;
	}

	campground.count().exec((err, count) => {			//先算總共幾筆campgroung
		//判斷有沒有查詢
		if(req.query.search){
			const regex = new RegExp(escapeRegex(req.query.search), 'gi');
			campground.find({name: regex}).skip((perPage*pageNum) - perPage).limit(perPage).exec(function(err, camps){
				if(err){
					req.flash("error", "Something Get Wrong!");
					res.redirect("/camp");
				}else{
					res.render("campground/index",{camps:camps,
												   current:pageNum,
												   totalPages:Math.ceil(count / perPage)});
				}
			});
		}else{
			campground.find({}).skip((perPage*pageNum) - perPage).limit(perPage).exec(function(err, camps){
				if(err){
					req.flash("error", "Something Get Wrong!");
					res.redirect("/camp");
				}else{
					res.render("campground/index",{camps:camps,
												   current:pageNum,
												   totalPages:Math.ceil(count / perPage)});
				}
			});
		}
	});
});

//新增資訊實作-CREATE
router.post("/", middleware.isLogin, upload.single('img'), function(req, res){
	cloudinary.uploader.upload(req.file.path, function(err, result) {		//傳入參數圖片所建立的file用req.file進行呼叫，並上傳圖片
		req.body.campground.img = result.secure_url;		//上傳完成的圖片有result物件，內含多種資訊，url或secure_url為圖片網址
		req.body.campground.imgID = result.public_id;
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		}
		campground.create(req.body.campground, function(err, campground) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.redirect('/camp/' + campground.id);
		});
	});
});

//新增資訊頁面-NEW
router.get("/new", middleware.isLogin, function(req, res){
	res.render("campground/new");
});

//詳細資訊頁面-SHOW
router.get("/:id", function(req,res){
	campground.findById(req.params.id).populate("comments reviews").exec(function(err, foundcamp){
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
router.put("/:id", middleware.checkOwnership, upload.single('img'), function(req, res){
	campground.findByIdAndUpdate(req.params.id, req.body.campground, async function(err, updatecamp){
		if(err){
			console.log(err.message);
			req.flash("error", "something goes wrong");
			res.redirect("/camp");
		}else{
			if(req.file){
				await cloudinary.uploader.destroy(updatecamp.imgID);
				await cloudinary.uploader.upload(req.file.path, (err, result) => {
					updatecamp.img = result.secure_url;
					updatecamp.imgID = result.public_id;
					updatecamp.save();
				});
			}
			req.flash("success", "Campground has been updated");
			res.redirect("/camp/" + req.params.id);
		}
	});
});

//刪除功能實作-DESTROY(連帶刪除comment/圖片/reviews)
router.delete("/:id", middleware.checkOwnership, function(req, res){
	campground.findByIdAndRemove(req.params.id, function(err, removecamp){
		if(err){
			req.flash("error", "Something Get Wrong!");
			res.redirect("/camp");
		}else{
			cloudinary.uploader.destroy(removecamp.imgID);
			comment.deleteMany( {_id: { $in: removecamp.comments } }, (err) => {
				if (err) {
					console.log(err);
				}else{
					review.deleteMany({_id: {$in: removecamp.reviews}}, (err) => {
						if (err) {
							console.log(err);
							return res.redirect("/camp");
						}
						req.flash("success", "Campground deleted successfully!");
						res.redirect("/camp");
					});
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