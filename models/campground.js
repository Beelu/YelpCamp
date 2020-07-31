var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
	name: String,
	price: String,
	img: String,
	imgID: String,
	description: String,
	createdAt: { type: Date, default: Date.now }, 
	author:{
		id:{type: mongoose.Schema.Types.ObjectId, ref: "user"},
		username: String
	},
	comments: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: "comment"
    }],
	reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("campground",campgroundSchema);