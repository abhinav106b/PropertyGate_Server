var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var authenticate = require('../authenticate');
const Users = require('../models/user');
var helper = require('../helper');
const Property = require('../models/property');


router.get('/:id', authenticate.verifyToken,async function (req, res, next) {  //here id represents seller id of the clicked property
  Users.findById(req.params.id)
  .then((user)=>{
    let data = new Object();
    helper.response.user.map((each)=>{
      data[each] = user[each]
    })
    res.statusCode = 200;
    res.json({message: "success",data: data});
  })
  .catch((err)=>{
    next(err);
  })
});

router.get('/',authenticate.verifyToken,async function(req,res,next){
  Users.findById(req.user)
  .then((succ)=>{
    let data= new Object();
    helper.response.user.map((each)=>{
      data[each]= succ[each]
    })
    res.statusCode=200;
    res.json({message:"Success",data: data})
  })
  .catch((err)=>{
    next(err)
  })
})

router.post('/register',async (req,res,next)=>{
  let userpayload = new Object();
  let f;
  helper.validate.user.map((each)=>{ //validating the user payload
    if(!req.body[each]){
      f=1;
    }
    else{
      userpayload[each] = req.body[each]
    }
  })
  if(f==1){
    res.statusCode = 400;
    res.send("Value missing ");
  }
  else{
  let hashPassword = await authenticate.createPasswordHash(userpayload.password);
  userpayload.password = hashPassword

  Users.create(userpayload)  //User is created
  .then(async(succ)=>{
    let token = authenticate.getToken(succ._id,succ.email);
    res.statusCode=200;
    res.send({token: token, message: "Regitered Successfully"})
  })
  .catch((err)=>{
    console.log(err)
    next(err)
  })
}
})

router.post('/login',async(req,res,next)=>{
  let email = req.body.email;
  let password = req.body.password;
  Users.findOne({email: email}) // checks whether the user is present
  .then(async(rsp)=>{
    console.log(rsp)
    let match = await authenticate.verifyPassword(password,rsp.password);
    if(match){                  //if present then checks the password if true then token is created
      let token = authenticate.getToken(rsp._id,rsp.email);
      res.statusCode =200;
      res.send({token: token, message:"Login Success"})
    }
    else{
      res.statusCode = 401 //Unauthorized
      res.send({message: "Wrong email or password "})
    }
  })
  .catch((err)=>{
    let error = new Error("User not Found, please register before login");
    error.status = 404;
    next(error);
  })
})


router.post('/logout',authenticate.verifyToken,async(req,res,next)=>{

  authenticate.blackListToken(req.token) // token is blacklisted so that it can't be used again
  res.statusCode =200;
  res.send({message: "Logged out successfully"})
})

module.exports = router;
