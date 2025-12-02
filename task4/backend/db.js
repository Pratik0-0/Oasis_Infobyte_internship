const mongoose = require('mongoose');

//creating the schema fro the database
const schema = mongoose.Schema;
const ObjectId = schema.ObjectId;
//since we need two fields
const user = new schema({
    email: { type :String, unique : true},
    password: String,
    salt: String,
    name : String
});

//similarly for todo
const todo = new schema({
    title: String,
    done: Boolean,
    userID: ObjectId,

});


//creating the model 
//const modelName = mongoose.model("whereIn DB", in-hich-schema);
const Usermodel = mongoose.model("users", user);
const Todomodel = mongoose.model("todo-collection", todo);

// now to export these models
module.exports = {Usermodel, Todomodel};