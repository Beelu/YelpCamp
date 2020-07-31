//評分物件
var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: "Please provide a rating (1-5 stars).",
        min: 1,
        max: 5,
        // Adding validation to see if the entry is an integer
        validate: {
            // validator accepts a function definition which it uses for validation
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
    },
    text: String,
    author: {
		id: {
    		type: mongoose.Schema.Types.ObjectId,
    		ref: "user"
    	},
    	username: String
    },
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "campground"
    }
}, {
    // if timestamps are set to true, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
    timestamps: true
});

module.exports = mongoose.model("review", reviewSchema);