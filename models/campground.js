var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
	name: String,
	price: String,
	img: String,
	description: String,
	createdAt: { type: Date, default: Date.now }, 
	author:{
		id:{type: mongoose.Schema.Types.ObjectId, ref: "user"},
		username: String
	},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "comment"
      }
   ],
	
});

module.exports = mongoose.model("campground",campgroundSchema);