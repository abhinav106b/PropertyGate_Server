const express = require('express');
const axios = require('axios');
var authenticate = require('../authenticate');
var router = express.Router();
const User = require('../models/user');
const Profile = require('../models/profile');

router.get('/google', (req, res,next) => {
    const { client_id, redirect_uri, response_type } = process.env;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=openid%20profile%20email`;
    res.redirect(authUrl);
});

router.get('/google/callback', async (req, res,next) => {
    const { code } = req.query; // getting auth code from google
    console.log("Code", code)
  
    try {
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
        code,
        redirect_uri: process.env.redirect_uri,
        grant_type: 'authorization_code',
      });
  
      const accessToken = data.access_token;
      // Use the access token to fetch user information from the userinfo endpoint
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const userInfo = userInfoResponse.data;
      User.findOne({email: userInfo.email})
      .then((rsp)=>{
        if(rsp!== null){
            let token = authenticate.getToken(rsp._id,rsp.email);
            res.statusCode = 200;
            res.send({token: token, message: "Login Success"})
        }
        else{
            User.create({email: userInfo.email, googleId: userInfo.sub, name: userInfo.name})
            .then(async(succ)=>{
                let token = authenticate.getToken(succ._id, userInfo.email);
                res.statusCode =200;
                res.send({token:token, message: "Registered Successfully"});
                await Profile.create({name: userInfo.name, imageUrl: userInfo.picture, userId: succ._id,email: userInfo.email})
            })
            .catch((err)=>{
                let error = new Error("Something went wrong..")
                error.status =500
                next(error)
            })
        }
      })
      .catch((err)=>{
        next(err)
      })
      console.log("google data ", userInfo);
    } catch (error) {
      console.error('Error exchanging authorization code for access token:', error);
      res.status(500).send('Error');
    }
});

module.exports = router;
