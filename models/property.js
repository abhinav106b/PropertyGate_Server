const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var propertySchema = new Schema({
    price:{
        type: Number,
        required: true
    },
    aptType:{
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    bathrooms:{
        type: Number
    },
    sellerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likeCount:{
        type: Number,
        default: 0
    },
    image:{
        type: String
    }
},{
    timestamps: true
})

var Property = mongoose.model("Property", propertySchema);

module.exports = Property;