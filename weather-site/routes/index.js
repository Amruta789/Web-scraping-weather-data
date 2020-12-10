var express = require('express');
var router = express.Router();
var Users = require("../models/Users");
var scrape=require('../utilities/cheerio-scrape');
var fs = require("fs");

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
router.get('/', function(req, res) {
  res.redirect('/login');
});

// Displays login page
router.get('/login',sessionChecker,function(req,res){
  res.render("login",{message:null});
});

// Displays register page
router.get('/signup',function(req,res){
  res.render('signup',{message:null});
});

// Displays reset password page
router.get('/resetpassword',function(req,res){
  res.render("resetpassword");
});

// Displays change password page, it can be done only if user is logged in 
router.get('/changepassword', function(req, res){
  if (req.session.user && req.cookies.user_sid) {
    res.render('changepassword',{message:null});
  }else{
    res.render("login",{message: "Please login again"});
  }
})

// This displays the search page, can only be done if user has logged in
router.get('/search', async function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    // If admin, different navbar for the page 
    if(req.session.user.username==='Admin'){
      res.render('weatherresults',{admin: true, records: null});
    }else{
      res.render('weatherresults',{admin: false, records: null});
    }    
  }else{
    res.render("login",{message: "Please login again"});
  }
})

// Logs out the user and redirects to login
router.get('/logout',function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");
    res.redirect("/");
  } else {
    res.render("login",{message: null});
  }
});

router.post('/login', async function(req,res,next){
  var username = req.body.username,
      password = req.body.password;
      try {
        var user = await Users.findOne({ username: username }).exec();
        if(!user) {          
            res.render("login",{message: "Can't find username, please sign up"});
        }
        // Calls comparePassword function defined in the models/Users file
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

router.post('/signup', function(req,res){
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

// It sends a random 8 character string back to the user for the new password, and changed in database
router.post('/resetpassword',async function(req,res){
  // Takes username, email and phone number and validates it in database
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

// Changes password based on user input
router.post('/changepassword', async function(req, res){
  var username = req.body.username;
  var currentpassword = req.body.cpassword;
  var newpassword = req.body.npassword;
      try {
        var user = await Users.findOne({ username: username }).exec();
        if(!user) {          
            res.render("changepassword",{message: "Incorrect username"});
        }
        user.comparePassword(currentpassword, async (error, match) => {
            if(!match) {
              res.render("changepassword", {message: "Incorrect old password"});
            }else{
              user.password=newpassword;
              await user.save();
              res.redirect('/dashboard');
            }
        });
        
    } catch (error) {
      console.log(error)
    }
})

// Takes place as input and calls scrapeData function in utilities/cheerio-scrape.js file
router.post('/search',async function(req,res){
    var result=await scrape.scrapeData(req.body.place);
    if (req.session.user && req.cookies.user_sid) {
      if(req.session.user.username==='Admin'){
        res.render('weatherresults',{admin: true, records: result});
      }else{
        res.render('weatherresults',{admin: false, records: result});
      }
    }else{
      res.render("login",{message: "Please login again"});
    }
});

// Stores the profile picture path in database
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



module.exports = router;

