const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    phone:{
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
    },
    googleId:{
        type: String
    }
},{
    timestamps: true
})

var Users = mongoose.model("User", userSchema);

module.exports = Users;
