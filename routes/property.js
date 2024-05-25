const express = require('express');
var router = express.Router();
const bosyParser = require('body-parser');
router.use(bosyParser.json());
var authenticate = require('../authenticate')
var Property = require('../models/property')
const helper = require('../helper');
var User = require('../models/user');

const imageArr=["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXX99tUbgJEWQ1LW_beTYGChK_-ubPt_suIhiY33YUvg&s","https://media.self.com/photos/630635c30b7f36ce816f374a/4:3/w_2240,c_limit/DAB03919-10470989.jpg",
    "https://media.istockphoto.com/id/1398814566/photo/interior-of-small-apartment-living-room-for-home-office.jpg?s=612x612&w=0&k=20&c=8clwg8hTpvoEwL7253aKdYAUuAp1-usFOacNR5qX-Rg=",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEF7sHrbcoTHAq0MGEJTeBAOuJICFBLzj7SWtQVXk6iQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEF7sHrbcoTHAq0MGEJTeBAOuJICFBLzj7SWtQVXk6iQ&s",
    "https://www.apartments.com/blog/sites/default/files/styles/large/public/image/2023-06/the-huntley-atlanta-ga-luxury-apartment-view.jpg?itok=l26TswZZ"
]

router.post('/',authenticate.verifyToken,(req,res,next)=>{
    if(req.role == 'seller'){
        let propertyPayload = new Object();
        helper.validate.property.map((each)=>{
            propertyPayload[each] = req.body[each]
        })
        const randomIndex = Math.floor(Math.random() * imageArr.length);
        propertyPayload["image"]= imageArr[randomIndex];
        propertyPayload.sellerId = req.user;
        Property.create(propertyPayload)
        .then((succ)=>{
            res.statusCode = 200;
            res.json({message: "Property Successfully added", data: succ})
        })
        .catch((err)=>{
            next(err)
        })
    }
    else{
        res.statusCode = 404;
        res.json({message: "Unauthorized: Only seller can add property"});
    }
})

router.patch('/:id',authenticate.verifyToken,async(req,res,next)=>{
    if(req.role == 'seller'){
        let match = await Property.findById(req.params.id);
        if(match.sellerId == req.user){
            let update = new Object();
            //safety check
            helper.pathData.property.map((each)=>{
                update[each] = req.body[each]
            })
            Property.findByIdAndUpdate(req.params.id,update,{new: true})
            .then((succ)=>{
                res.status= 200;
                res.json({message: "Successfully updated",data: succ})
            })
            .catch((err)=>{
                next(err)
            })
        }
        else{
            let error = new Error("Unauthorized: Only property owners can do update");
            error.status = 404;
            next(error)
        }
    }
    else{
        res.statusCode = 404;
        res.json({message: "Unauthorized: Only seller can update their property"});
    }
})

router.delete('/:id',authenticate.verifyToken,async(req,res,next)=>{
    if(req.role == 'seller'){
        let match = await Property.findById(req.params.id);
        if(match.sellerId == req.user){
            Property.findByIdAndDelete(req.params.id)
            .then((succ)=>{
                res.statusCode = 200;
                res.json({message: "Property successfully deleted"});
            })
            .catch((err)=>{
                next(err)
            })
        }
        else{
            let error = new Error("Unauthorized: Only property owners can delete the property");
            error.status = 404;
            next(error)
        }
    }
    else{
        res.statusCode = 404;
        res.json({message: "Unauthorized: Only seller can delete their property"});
    }
})

router.get('/',async(req,res,next)=>{
    let propertyData = await Property.find({})
    res.statusCode = 200;
    res.json({message: "Success",data: propertyData});
})

router.get('/seller',authenticate.verifyToken,(req,res,next)=>{
    if(req.role == 'seller'){
        Property.find({sellerId: req.user})
        .then((succ)=>{
            res.statusCode = 200;
            res.json({message: "Success",data: succ})
        })
        .catch((err)=>{
            next(err)
        })
    }
    else{
        res.statusCode = 404;
        res.json({message: "Only authorized seller can view their property"})
    }
})

router.patch('/like/:id',authenticate.verifyToken,async(req,res,next)=>{
    let prData= await Property.findByIdAndUpdate(req.params.id,{$inc:{likeCount:+1}},{new:true})
    if(prData){
        res.statusCode = 200;
        res.json({message: "Done",data:prData})
    }
    else{
        res.statusCode = 404;
        res.json({message: "Please login before using this action"})
    }
    
})

router.patch('/dislike/:id',authenticate.verifyToken,async(req,res,next)=>{
    let prData= await Property.findByIdAndUpdate(req.params.id,{$inc:{likeCount:-1}},{new:true})
    if(prData){
        res.statusCode = 200;
        res.json({message: "Done",data:prData})
    }
    else{
        res.statusCode = 404;
        res.json({message: "Please login before using this action"})
    }
    
})

module.exports = router;