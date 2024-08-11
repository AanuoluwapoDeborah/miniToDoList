const express = require("express");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

//Set up a scheme for my application
const todoSchema = new mongoose.Schema({
    todoTitle: { type: String, require: [true, "TodoTitle is required"], trim: true },
    todoContent: { type: String, require: [true, "todoContent is required"], trim: true }
})

//Set up a model for my application
const todoModel = mongoose.model("TodoModel", todoSchema);
let connectionString = process.env.CONNECTION_STRING

//Set up middleware to parse request bodies
app.use(express.urlencoded({ extended: true }))

app.set("view engine", "ejs");

let todoArray = []

//Database Quaries
// When creating to database you make use of .create({})
// When you're trying to retrieve all data from database you use .find({})
// When you're trying to retrieve single data from database you use .findOne({})
// When you're trying to delete single data from database you use .findOneAndDelete({}) || findByIdAndDelete({id})
// When you're trying to update single data from database you use .findOneAndUpdate({}) || findByIdAndUpdate({id})
// When you're trying to delete all data from database you use .deleteAll({})

// C R U D E OPERATION IN MONGOODE

// Creating Todo
app.post("/", async (req, res) => {
    const { title, content } = req.body;
    if(!title || !content) {
     return  console.log("All fields are required");
    }

    try {
        const todo = await todoModel.create({
            todoTitle: title,
            todoContent: content
        });
    
        if(todo){
            console.log("Todo Created Sucessfully");
        } else{
            console.log("Error Creating Todo");
        }
    } catch (error) {
        console.log("Internal Server Error, Error Creating Todo", error)
    }
    res.redirect("/");
});

// Retrieving all available Todo
app.get("/", async (req, res) => {
    try {
        const allAvailableTodo = await todoModel.find();
        if(allAvailableTodo){
            console.log("Todo fetched successfully", allAvailableTodo);
            res.render("index", {todoArray : allAvailableTodo});
        } else{
            console.log("Error retrieving Todo's");
        }
    } catch (error) {
        console.log("Server Error, Error fetching all Todo's");
    }
});

// Connecting to database
const connectDb = async () => {
    try {
        const connect = await mongoose.connect(connectionString);
        if (connect) {
            console.log("Database connected sucessfully");
        } else {
            console.log("Error occured while trying to connect to the database")
        }
    } catch (error) {
        console.log("Error connecting to database : ", error)
    }
};

connectDb();

// Delete Todo
app.post("/deleteTodo/:id", async (req, res) => {
    console.log("Delete ID : ", req.params.id);
    let id = req.params.id;
    try {
        const deleteTodo = await todoModel.findByIdAndDelete(id);
        if(deleteTodo){
            console.log("Todo deleted successfully");
        }else{
            console.log("Error deleting todo")
        }
    } catch (error) {
        console.log("Server Error, Error Deleting Todo", error);
    }
    res.redirect("/");
});

//Edit Todo
app.post("/editTodo/:id", async (req, res) => {
    const id = req.params.id;
    console.log("Edit ID : ", id)
    try {
        const editTodo = await todoModel.findById(id);
        if (editTodo) {
            console.log("Received Todo : ", editTodo)
            res.render("edit", { todo : editTodo });
        } else{
            console.log("Todo not found");
            res.redirect("/");
        }
    } catch (error) {
        console.log("Server Error, Error Editing Todo", error);
    }
});

// Update Todo
app.post("/updateTodo/:id", async (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        console.log("All fields required")
    }
    
    const id = req.params.id;

    try {
        const updatedTodo = await todoModel.findByIdAndUpdate(id, { todoTitle : title, todoContent : content }, { new: true });
        if (updatedTodo) {
            console.log("Todo updated successfully:", updatedTodo);
        } else {
            console.log("Todo not found");
        }
    } catch (error) {
        console.log("Error updating todo:", error);
    }
    res.redirect("/");
})

const port = process.env.PORT || 5000
app.listen(5000, () => {
    console.log("Server is running on port " + port)
});