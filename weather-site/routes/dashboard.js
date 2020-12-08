var express = require('express');
var router = express.Router();
var Users = require("../models/Users");
var scrape=require('../utilities/cheerio-scrape');
var fs = require("fs");
const fileType = require("file-type");

router.get('/', function(req, res, next) {
if (req.session.user && req.cookies.user_sid) {
    Users.findOne({ username: req.session.user.username }, async function(err, user) {
    if (err) {
        console.log("err" + err);
    } else if (user && "profilePicturePath" in user) {
        if (fs.existsSync(req.rootPath + user.profilePicturePath)) {
        console.log(req.rootPath + user.profilePicturePath);
        let img = fs.readFileSync(req.rootPath + user.profilePicturePath);
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

router.get('/search', async function(req,res){
  res.render('weatherresults',{records: null});
})

router.get('/contactus', async function(req,res){
  res.render('contact');
})

router.post('/search',async function(req,res){
    var result=await scrape.scrapeData(req.body.place);
    
    res.render('weatherresults', { records: result});
});
  
  router.post('/message', async(req, res) => {
    //send email here
    try {
      if (req.session.user && req.cookies.user_sid) {
        var user = await Users.findOne({ username: req.session.user.username }).exec();
        if(user) { 
          const text  = req.body.message;
          console.log('Data: ', req.body);
          var Admin=await (Users.findOne({ username: 'Admin'})).execPopulate();
  
          if (!text) {
            res.send("Error: Message should not be Blank");
            return false;
          }else{
            var obj={
              from: user.username,
              message: text
            }
            Admin.messages.push(obj);
            await Admin.save();
          }        
        }
      }
    } catch (error) {
      console.log(error)
    }  
  });

  router.get('/logout',function(req,res,next){
    if (req.session.user && req.cookies.user_sid) {
      res.clearCookie("user_sid");
      res.redirect("/");
    } else {
      res.render("login",{message: null});
    }
  });

module.exports=router;