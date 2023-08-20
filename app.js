//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Caroline_X1231:13145570888@cluster0.ztwys9b.mongodb.net/todolistDB",{useNewUrlParser: true})
  .then(()=>console.log('connected'))
  .catch(e=>console.log(e));

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"很困的糕"
});

const item2 = new Item({
  name:"思念小糖"
});

const defaultItems = [item1,item2];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

const items = ["Buy Food", "Cook Food", "Eat Food"];

const workItems = [];

app.get("/", function(req, res) {
  const day = date.getDate();
  Item.find({})
    .then(function(foundItems){
      if (foundItems.length === 0 ){
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved defult items to DB");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      }else{
        res.render("list", {listTitle: day, newListItems: foundItems});
      };
    })
    .catch(function(err){
      console.log(err);
    });
});

app.post("/", function(req, res){
  console.log(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();

  const newItem = new Item({
    name: itemName
  });

  if(listName === day){ 
    newItem.save()
      .then(function(){
        res.redirect("/");
      });
  }else{
    List.findOne({name:listName})
      .then(function(foundList){
        let foundListArray = foundList.items
        foundListArray.push(newItem);
        foundList.save()
          .then(function(){          
            res.redirect("/" + listName);
          });
      });
  };
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  const day = date.getDate();
  if (listName === day){
    Item.findByIdAndRemove(checkedItemId)
      .then(function(){
        console.log("Successfully removed!");
        res.redirect("/");
      });
  }else{
    // List.findByIdAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    //   .catch(function(err){
    //     if(!err){
    //       res.redirect("/"+listName);
    //     }else{
    //       console.log(err);
    //     }
    //   })
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
  )
      .then(function () {
          res.redirect("/" + listName);
      })
      .catch(function (err) {
          console.log(err);
      });

  };
});

app.get("/:customListName",function (req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName})
    .then(function(foundList){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  )

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log(`Server started on port ${PORT}`);
});
