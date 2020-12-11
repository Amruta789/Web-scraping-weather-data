var express = require('express');
var router = express.Router();
var Users = require("../models/Users");
var fs = require("fs");
const fileType = require("file-type");

// Admin dashboard contains options to insert, update, delete, view users and messages 
router.get('/', async (req, res) =>{
  if (req.session.user && req.cookies.user_sid) {
      res.render("admindashboard",{ error: null, success:null, allmessages: null, values: null})
  }else{
    res.render("login",{message: "Please login again"});
  }
})

// On click, displays all user details from database
router.get('/users', async (req,res)=>{
  const users=await Users.find({}).exec();
  res.render("admindashboard", {error: null, success:null, allmessages: null, values: users});
})

// On click, displays all messages sent to admin
router.get('/messages', async function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    if(req.session.user.username==='Admin'){
      const admin=await Users.findOne({ username: req.session.user.username }).exec();
      res.render("admindashboard", { error: null, success: null, allmessages: admin.messages, values: null});
    }
  }
})

// To display profile page for admin 
router.get('/adminprofile', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
      Users.findOne({ username: req.session.user.username }, async function(err, user) {
        if (err) {
            console.log("err" + err);
        } else if (user && "profilePicturePath" in user) {
            // req.rootPath is a variable that stores abbsolute path, it is defined in app.js
            if (fs.existsSync(req.rootPath + user.profilePicturePath)) {
            console.log(req.rootPath + user.profilePicturePath);
            let img = fs.readFileSync(req.rootPath + user.profilePicturePath);
            // fileType.fromBuffer() returns mime and extension of img
            let mime = await fileType.fromBuffer(img);
            img = new Buffer.from(img, "binary").toString("base64");
            
            res.render("adminprofile", {
                mime: mime.mime,
                img: img,
                username: user.username,
                email: user.email,
                phone: user.phone
            });
            } else {
            res.render("adminprofile", {
                mime:null,
                img: null,
                username: user.username,
                email: user.email,
                phone: user.phone,
            });
            }
        } 
        });
    }else{
        res.render("login",{message: "Please login again"});
    }
})

// On click, it displays only one user's details, taking username as input
router.post('/viewone',async function(req,res){
  const user=await Users.findOne({ username: req.body.username }).exec();
  res.render("admindashboard", {error: null, success:null, allmessages: null, values: user});
})

// Takes, username, key, and new value as input and updates the user's details 
router.post('/update',async function(req,res){
    var username = req.body.username,
        key = req.body.key;
        newvalue = req.body.newvalue;
        try {
          var user = await Users.findOne({ username: username }).exec();
          if(!user) {          
              res.render("admindashboard",{error:"Invalid username", success: null, allmessages:null, values:null});
          }
            user[key]=newvalue;
            await user.save();
            res.render("admindashboard", {error:null, success: "Successfully updated", allmessages:null, values:null});
          
      } catch (error) {
        console.log(error)
      }
})

// Deletes all the user details based on username input
router.post('/delete',async function(req,res){
     Users.findOneAndDelete({ username: req.body.username }, function (err) {
        if(err){ 
          console.log(err)
        }else{
          console.log("Successful deletion");
          res.render("admindashboard", {error:null, success: "Successfully deleted", allmessages:null, values:null});
        }
      });
});
  
module.exports=router;