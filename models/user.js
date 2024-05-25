const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    phone:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    }
},{
    timestamps: true
})

var Users = mongoose.model("User", userSchema);

module.exports = Users;
