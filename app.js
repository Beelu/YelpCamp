if (process.env.NODE_ENV !== "production") {
	require('dotenv').config();
}

var express = require("express"),
	app = express(),
	bodyparser = require("body-parser"),
	mongoose = require("mongoose"),
	flash = require("connect-flash"),
	passport = require("passport"),
	passportLocal = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	methodoverride = require("method-override"),
	campground = require("./models/campground"),
	comment = require("./models/comment"),
	user = require("./models/user")

var campgroundRoute = require("./routes/campground"),
	commentRoute = require("./routes/comment"),
	indexRoute = require("./routes/index"),
	userRoute = require("./routes/user"),
	reviewRoutes = require("./routes/review")

//連接資料庫&設置
app.locals.moment = require("moment");
var url = process.env.databaseURL || "mongodb://localhost/yelp_camp";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodoverride("_method"));
app.use(flash());

//passport
app.use(require("express-session")({
	secret: "ZaWarudo",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(function (req, res, next) {
	res.locals.currentuser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//用route
app.use("/", indexRoute);
app.use("/camp", campgroundRoute);
app.use("/camp/:id/comment", commentRoute);
app.use("/user/:user_id", userRoute);
app.use("/camp/:id/review", reviewRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function () {
	console.log("The YelpCamp Server Started!");
});