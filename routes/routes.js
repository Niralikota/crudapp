const express = require('express')
const router = express.Router();
const User = require("../models/users")
const multer = require('multer')
const fs = require('fs');
const { type } = require('os');
//image upload
var storage = multer.diskStorage({
    destination:function(req,file,cd){
        cd(null,"./uploads")
    },
    filename:function(req,file,cd){
        cd(null,file.fieldname+"_"+Date.now()+"_"+file.originalname)
    },
});

var upload = multer({
    storage:storage,
}).single("image");

router.post("/add", upload, async (req, res) => {
    try {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
      });
      await user.save();
      req.session.message = {
        type: "success",
        message: "User added successfully!",
      };
      res.redirect("/");
    } catch (err) {
      res.json({ message: err.message, type: "danger" });
    }
  });


  

  router.get('/', async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render('index', {
        title: 'Home page',
        users: users
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  });
  
router.get('/add',(req,res)=>{
    res.render("add_users",{title:"Add Users"})
});

//edit an user

router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id)
    .then(user => {
      if (user === null) {
        res.redirect('/');
      } else {
        res.render("edit_users", {
          title: "Edit User",
          user: user
        });
      }
    })
    .catch(err => {
      res.redirect('/');
    });
});

//update user route
router.post("/update/:id",upload,(req,res)=>{
  let id = req.params.id;
  let new_image = "";
  if(req.file){
    new_image = req.file.filename;
    try{
      fs.unlinkSync("./uploads/" + req.body.old_image);
    }catch(err){
      console.log(err);
    }
  }else{
    new_image = req.body.old_image;
  }
  User.findByIdAndUpdate(id,{
    name:req.body.name,
    email:req.body.email,
    phone:req.body.phone,
    image:new_image
  })
  .then(result => {
    req.session.message = {
      type:"success",
      message:"User Updated Successfully!"
    };
    res.redirect('/')
  })
  .catch(error => {
    res.json({message: error.message, type: "danger"});
  });
});


//Delete user route

router.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  User.findByIdAndRemove(id)
    .then(result => {
      if (result.image !== '') {
        try {
          fs.unlinkSync('./uploads/' + result.image);
        } catch (err) {
          console.log(err);
        }
      }
      req.session.message = {
        type: 'info',
        message: 'User Deleted Successfully!'
      };
      res.redirect('/');
    })
    .catch(error => {
      res.json({ message: error.message, type: 'danger' });
    });
});





module.exports = router;