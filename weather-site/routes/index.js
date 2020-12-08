var express = require('express');
var router = express.Router();
var Users = require("../models/Users");

var scrape=require('../utilities/cheerio-scrape');
var fs = require("fs");
const fileType = require("file-type");

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    if(req.session.user.username==='Admin')
      res.redirect("/admindashboard");
    else{
      res.redirect('/dashboard')
    }
  } else {
    next();
  }
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

router.get('/login',sessionChecker,function(req,res,next){
  res.render("login",{message:null});
});

router.post('/login', async function(req,res,next){
  var username = req.body.username,
      password = req.body.password;
      try {
        var user = await Users.findOne({ username: username }).exec();
        if(!user) {          
            res.render("login",{message: "Can't find username, please sign up"});
        }
        user.comparePassword(password, (error, match) => {
            if(!match) {
              res.render("login", {message: "Incorrect password"});
            }
        });
        req.session.user = user;
        if(user.username==='Admin'){
          res.redirect('/admindashboard');
        }else{
          res.redirect("/dashboard");
        }
    } catch (error) {
      console.log(error)
    }
});

router.get('/signup',function(req,res,next){
  res.render('signup',{message:null});
});

router.post('/signup', function(req,res,next){
  const user= new Users({
    username:  req.body.username,
    password:  req.body.password,
    email:  req.body.email,
    phone:  req.body.phone
  })
  user.save((err, docs) => {
    if (err) {
      res.render("signup",{message: "Error signing up, username or email may already exist."});
    } else {
      console.log(docs)
      req.session.user = docs;
      if(user.username==='Admin'){
        res.redirect('/admindashboard');
      }else{
        res.redirect("/dashboard");
      }
    }
  });

});

router.get('/resetpassword',function(req,res){
  res.render("resetpassword");
});

router.post('/resetpassword',async function(req,res,next){
  var username=req.body.username;
  var email=req.body.email;
  var phone=req.body.phone;
  try {
    var user = await Users.findOne({ username: username }).exec();
    if(!user) {          
        res.render("resetpassword",{message: "Can't find username, please sign up"});
    }else if(user.email!==email || user.phone!==phone){
      res.render("resetpassword",{message: "Email or phone number is incorrect"});
    }
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 8; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    user.password=result;
    await user.save();
    res.send({success: true, newpassword: result});
  } catch (error) {
    console.log(error)
  }  
});

router.post('/uploadPhoto', function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    var base64Data = req.body.imgBase64.replace(/^data:image\/jpeg;base64,/, "");
    var path = "." + req.body.fileName;
    fs.writeFile(path, base64Data, "base64",async function(err) {
      if (err) {
        console.log(err);
      } else {
        await Users.findOne({ username: req.session.user.username }, function(err, user) {
          console.log(JSON.stringify(user));
          if (err) {
            console.log("err"+err);
          } else if (user) {
            console.log("test4");
            user.profilePicturePath = req.body.fileName;
            user.save(); 
            console.log(user);
          }
          res.redirect("/");
        });
      }
    });
    
  } else {
    res.render("login",{message: "Please login again"});
  }
});

router.get('/changepassword', function(req, res){
  res.render('changepassword',{message:null});
})

router.post('/changepassword', async function(req, res){
  var username = req.body.username,
      cpassword = req.body.cpassword;
      npassword = req.body.npassword;
      try {
        var user = await Users.findOne({ username: username }).exec();
        if(!user) {          
            res.render("changepassword",{message: "Incorrect username"});
        }
        user.comparePassword(cpassword, async (error, match) => {
            if(!match) {
              res.render("changepassword", {message: "Incorrect old password"});
            }else{
              user.password=npassword;
              await user.save();
              res.redirect('/dashboard');
            }
        });
        
    } catch (error) {
      console.log(error)
    }
})

module.exports = router;

