const express = require('express');
var router = express.Router();
const bosyParser = require('body-parser');
router.use(bosyParser.json());
var authenticate = require('../authenticate')
var Property = require('../models/property')
const helper = require('../helper');
var User = require('../models/user');
require('dotenv').config();
var nodemailer = require('nodemailer')


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${process.env.EMAIL}`,
      pass: `${process.env.EMAIL_PASS}`
    }
  });

router.post("/",authenticate.verifyToken,(req,res,next)=>{
    const { buyerEmail, sellerEmail, buyerDetails, sellerDetails } = req.body;

    const buyerMailOptions = {
        from: `${process.env.EMAIL}`,
        to: buyerEmail,
        subject: 'Seller Details for your Interested property',
        text: `Here are the details of the Seller you are interested in: \n\nSeller name:${sellerDetails?.firstName}\n\nSeller email:${sellerDetails?.email} \n\nSeller Contact: ${sellerDetails?.phone}`
      };
    
      const sellerMailOptions = {
        from: `${process.env.EMAIL}`,
        to: sellerEmail,
        subject: 'New Interested Buyer',
        text: `A buyer is interested in your property. Here are the buyer's details: \n\nBuyer name:${buyerDetails?.firstName}\n\Buyer email:${buyerDetails?.email} \n\Buyer Contact: ${buyerDetails?.phone}`
      };

    transporter.sendMail(buyerMailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        transporter.sendMail(sellerMailOptions, (error, info) => {
            if (error) {
            return res.status(500).send(error.toString());
            }
            res.status(200).send('Emails sent successfully');
        });
    });

    res.statusCode = 200;
    res.send("Success");
})

module.exports = router;