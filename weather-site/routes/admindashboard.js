var express = require('express');
var router = express.Router();
var Users = require("../models/Users");
var scrape=require('../utilities/cheerio-scrape');
var fs = require("fs");
const fileType = require("file-type");

router.get('/', (req,res)=>{
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
            
            res.render("admindashboard", {
                mime: mime.mime,
                img: img,
                username: user.username,
                email: user.email,
                phone: user.phone
            });
            } else {
            res.render("admindashboard", {
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

router.post('/viewone',async function(req,res){
  const user=(await Users.findOne({ username: req.body.username })).execPopulate();
  res.render("userdetails", {values: {username: user.username, email: user.email, phone: user.phone}});
})

router.get('/messages', async function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    if(req.session.user.username==='Admin'){
      const admin=(await Users.findOne({ username: req.session.user.username })).execPopulate();
      res.render("messages", { allmessages: admin.messages});
    }
  }

})

router.get('/users', async (req,res)=>{
  const users=await Users.find({}).exec();
  res.render("", {values: users});
})

router.post('/insert',async function(req,res){
    const user= new Users({
        username:  req.body.username,
        password:  req.body.password,
        email:  req.body.email,
        phone:  req.body.phone
      })
      user.save((err, docs) => {
        if (err) {
          
        } else {
          
        }
      });
})
router.post('/update',async function(req,res){
    var username = req.body.username,
        key = req.body.key;
        newvalue = req.body.newvalue;
        try {
          var user = await Users.findOne({ username: username }).exec();
          if(!user) {          
              res.render("",{message: "Incorrect username"});
          }
            user[key]=newvalue;
            await user.save();
            res.redirect('/admindashboard');
          
      } catch (error) {
        console.log(error)
      }
})

router.post('/delete',async function(req,res){
     Users.findOneAndDelete({ username: req.body.username }, function (err) {
        if(err) console.log(err);
        console.log("Successful deletion");
        res.status(200).send("Successfully deleted");
      });
});

router.post('/search',async function(req,res){
    var result=await scrape.scrapeData(req.body.place);
    
    res.render('weatherresults', { records: result});
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