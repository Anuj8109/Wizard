const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb://localhost:27017/listDB", {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<---Hit this to delete an item",
});

const defultItems = [item1, item2, item3];

const listschema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = new mongoose.model("List", listschema);

app.get("/", function (req, res) {
  const day = date.getDate();
  Item.find({}, function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully done");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const listName = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName,
  });
  console.log(listName)
  // if (listName == "Today") {
  //   item.save();
  //   res.redirect("/");
  // }
  List.findOne({name:listName},function(err,foundList){
    if (foundList){
      console.log(foundList)
    }else{
      console.log("working")
    }
  })
  res.redirect('/')
  // if (listName === "Today"){
  //   item.save();
  //   res.redirect("/");
  // }else{
  //   List.findOne({ name: listName }, function (err, foundList){
  //     // foundList.items.push(item);
  //     // foundList.save()
  //     // res.redirect('/'+listName)
  //     console.log(foundList)
  //   })
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked items.");
          res.redirect("/");
        }
    });
  }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},function(err,foundList){
          if(!err){
            res.redirect("/"+listName);
          }
        });
    }
});

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (foundList) {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      } else {
        const list = new List({
          name: customListName,
          items: defultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
