var express = require('express');
var router = express.Router();
var Users = require("../models/Users");
var scrape=require('../utilities/cheerio-scrape');
var fs = require("fs");
const fileType = require("file-type");

// First, user is redirected to search page
router.get('/', async function(req,res){
  res.redirect('/search');
})

// This displays account profile and contact form in footer
router.get('/myaccount', function(req, res, next) {
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
          
          res.render("dashboard", {
              mime: mime.mime,
              img: img,
              username: user.username,
              email: user.email,
              phone: user.phone
          });
        } else {
          res.render("dashboard", {
              mime:null,
              img: null,
              username: user.username,
              email: user.email,
              phone: user.phone,
          });
        }
    } 
    });
} else {
    res.render("login",{message: "Please login again"});
}
});

// Message given in contact form is sent to Admin and stored in Admin messsages array  
router.post('/message', async(req, res) => {
  try {
    if (req.session.user && req.cookies.user_sid) {
      var user = await Users.findOne({ username: req.session.user.username }).exec();
      if(user) { 
        const text = req.body.message;
        console.log('Data: ', req.body);
        var Admin= await Users.findOne({ username: 'Admin'}).exec();
        
        if (!text) {
          res.send("Error: Message should not be Blank");
          return false;
        }else{
          var obj={
            from: user.username,
            message: text,
            date: Date().toString()
          }
          
          Admin.messages.push(obj);
          await Admin.save();
          res.send("Succesfully sent message");
        }        
      }
    }
  } catch (error) {
    console.log(error)
  }  
});

module.exports=router;