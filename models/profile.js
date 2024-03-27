const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var profileSchema = new Schema({
    visibility:{
        type: Boolean,
        required: true,
        default: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name:{
        type: String,
        required: true
    },
    bio:{
        type: String,
    },
    imageUrl:{
        type: String,
    },
    email:{
        type: String
    },
    phone:{
        type: String
    },
    admin:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

var Profiles = mongoose.model("Profile", profileSchema);

module.exports = Profiles;