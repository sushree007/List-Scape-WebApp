const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded());
app.use(express.static("public"));

const _= require("lodash");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/listDB");
const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name:"Welcome to your To Do List"
});
const item2 = new Item({
    name:"Hit + to add a new item"
});
const item3 = new Item({
    name:"<-- Click on this box to delete an item"
});
const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List =  new mongoose.model("List", listSchema);





app.get("/", function (req, res) {

    Item.find({}, function(err, foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err) console.log(err);
                else console.log("Successfully inserted all items");
            });
            res.redirect("/");
        }
        else res.render("index", {kindOfDay:"Today", newListItems : foundItems});
    })

});



app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        })
    }
});

app.post("/delete", function(req,res){
    // const checkedItemId = req.body.checkbox;
    // Item.deleteOne({_id:checkedItemId}, function(err){
    //     if(!err) {
    //         console.log("Deleted item successfully");
    //         res.redirect("/");
    //     }
    // });

    const id = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(id, function(err){
            if(!err){
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            } 
        });
    }

    else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:id}}},function(err,foundList){
            if(!err) res.redirect("/"+listName);
        });
    }
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({name: customListName}, function(err, result){
        if(!err){
            if(result){
                // Display the existing list
                res.render("index", {kindOfDay: result.name, newListItems : result.items});
            }
            else{
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            }
        }
    });
});



app.listen(3000, function () {
    console.log("Server started successfully on port 3000");
});