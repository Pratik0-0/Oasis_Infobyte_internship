const exp = require('express');
const app = exp();
const {Usermodel, Todomodel} = require('./db');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 5;

const { z } = require('zod');

const cors = require('cors');
app.use(cors());
app.use(exp.json());


const en = require('dotenv');
en.config();
const DB_ADD = process.env.DB_ADD;
const JWT__SECRET = process.env.JWT__SECRET;
console.log(process.env.DB_ADD);


const jwt = require('jsonwebtoken');
//const { use } = require('react');
const secret = JWT__SECRET;


//conececting to the database
//async function connectDB(){
    //await 
    mongoose.connect(DB_ADD);
//}
//app.use(connectDB);
//middleware for authentication.
function auth(req, res, next){
    const token = req.headers.token;
    if(!token){
        return res.status(401).json({
            "message": "unauthorized"
        });
    }
    try{
        const decoded = jwt.verify(token, secret);
        req.userID = decoded.userID;
        next();
    }
    catch(err){
        return res.status(401).json({
            "message": "invalid token"
        });
    }
}

app.use(exp.json());

app.post("/singup", async function(req, res){

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    
    
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(hash);

    const validatated = z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(5).max(35),
        email: z.string().email()
    });
    const reso =  validatated.safeParse(req.body);
    if(!reso.success){
        res.json({
            "message": "invalid data fromat",
        })
    }
    // now we insert the data taken from hte user too the database

    //puting in the uer model
    const signedup = await Usermodel.create({
        name: username,
        email : email,
        password : hash
    });

    

    if(signedup){
        res.json({
            "message": "user signed up successfully"
        });
        console.log("user signed up");
    }

});

app.post("/login",async function(req, res){
   
    const username = req.body.username;
    const password = req.body.password;

    

    // now we will check if the user is present in the database or not
    const userpresent = await Usermodel.findOne({
        name: username
        // password: password

    });
    if(!userpresent){
        res.status(404).send("PLease check the credentials else the user dows not exist!");
    }
    const hash = userpresent.password;
    const isMatch = await bcrypt.compare(password, hash);

    if(isMatch){
        
        
        console.log("\n"+isMatch+"\n");

        if(isMatch){
            
            // now we will create a jwt token and send it to the user
            const token = jwt.sign({
                userID: userpresent._id
            }, secret);



            res.json({
                token: token

            });
            console.log("user logged in" + token);
        }
        else{
            res.status(401).json({
                "message": "invalid credentials"
            });
        }
    }

    
    

});

app.use(auth);

// now we will create the todo routes

app.post("/todo", async function(req, res){
    
    const title = req.body.title;
    const done = req.body.done;
    const userID = req.userID;

    // now we will insert this data into the database
     const newtodo = await Todomodel.create({
        title,
        done ,
        userID
    });

    res.json({
        "message": "todo created successfully"
    })


});
app.put("/todo/:id", async function(req, res){
    const todoId = req.params.id;
    const done = req.body.done;
    const userID = req.userID;

    try {
        await Todomodel.findOneAndUpdate(
            { _id: todoId, userID: userID },
            { done: done }
        );
        res.json({ message: "todo updated successfully" });
    } catch(err) {
        res.status(500).json({ message: "error updating todo" });
    }
});

app.get("/todos", async function(req, res){
    const userID = req.userID;

    const todos = await Todomodel.find({
        userID: userID
    });
    console.log(todos);
    res.json({
        "userID": userID,
        todos
    });
});



app.listen(3000);