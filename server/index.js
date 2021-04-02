const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const mongodb = require("mongodb");
const { hashing,hashCompare,createJWT, authenticate } = require("./authorize");
const {DB_URL} = require("./environment");
const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;

const dbUrl = DB_URL;

app.get("/", (req, res)=>{
  res.send("Welcome to my app!")
})

app.post("/register", async (req,res)=>{
const client = await mongoClient.connect(dbUrl);
if(client){
  try{
  const db = client.db("tktManager");
  const userExists = await db.collection("users").findOne({email:req.body.email});
  if(userExists){
    res.status(400).json({message:"user already exists!"});    
  }
  else{
    const hash = await hashing(req.body.password);
    req.body.password = hash;
    const userDoc = await db.collection("users").insertOne(req.body);
    if(userDoc){
      res.status(200).json({message:"user registered!"});      
    }
  }
client.close();
}
catch(error){
console.log(error);
client.close();
}
}
else{
  res.sendStatus(500);
}
})

app.post("/login", async(req,res)=>{
const client = await mongoClient.connect(dbUrl);
if(client){
  try{
       const{email,password} = req.body;
       const db = client.db("tktManager");
       const user = await db.collection("users").findOne({email});
       if(user){
         const compare = await hashCompare(password, user.password);
         if(compare){
           const token = await createJWT({email, id:user._id,role:user.role});
           return res.status(200).json({token});
         }
       }
       client.close();
  }
  catch(error){
    console.log(error);
    client.close();
  }
}
})

app.post("/add-movie", authenticate, async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");
        const data = await db.collection("movies").insertOne(req.body);
        if(data){
          res.status(200).json({message:"movie added!"});
        }
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.put("/update-movie/:id", authenticate, async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");
        await db.collection("movies").findOneAndUpdate({_id: objectId(req.params.id)}, {$set:req.body});
        res.status(200).json({message:"movie details modified!"});
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.delete("/delete-movie/:id", authenticate, async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");
        await db.collection("movies").deleteOne({_id:objectId(req.params.id)});
        res.status(200).json({message:"movie deleted!"});
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.get("/all-movies", async(req,res)=>{
    const client = await mongoClient.connect(dbUrl);
    if(client){
      try{
        const db = client.db("tktManager");
        const movieData = await db.collection("movies").find().toArray();
        if(movieData){
          res.status(200).json(movieData);          
        }
         client.close();
      }
      catch(error){
        console.log(error);
        client.close();
      }
    }
})

app.post("/add-theatre", authenticate, async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");
        const data = await db.collection("theatres").insertOne(req.body);
        if(data){
          res.status(200).json({message:"theatre added!"});
        }
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.put("/modify-theatre/:id", authenticate, async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");
        await db.collection("theatres").findOneAndUpdate({_id: objectId(req.params.id)}, {$set:req.body});
        res.status(200).json({message:"theatre details modified!"});
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.delete("/delete-theatre/:id", authenticate, async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");
        await db.collection("theatres").deleteOne({_id:objectId(req.params.id)});
        res.status(200).json({message:"theatre deleted!"});
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.get("/all-theatres",authenticate, async(req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
      const db = client.db("tktManager");
      const theatreData = await db.collection("theatres").find().toArray();
      if(theatreData){
        res.status(200).json(theatreData);          
      }
       client.close();
    }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.post("/movieandtheatre", authenticate, async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");
        const data = await db.collection("movie-theatre").insertOne(req.body);
        if(data){
          res.status(200).json({message:"movie alloted to the theatre"});
        }
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.get("/all-movieandtheatre", authenticate, async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");        
        const details = await db.collection("movie-theatre").find().toArray();
        if(details){
          res.status(200).json(details);
        }
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.post("/bookings", async (req,res)=>{
  const client = await mongoClient.connect(dbUrl);
  if(client){
    try{
        const db = client.db("tktManager");
        const data = await db.collection("bookings").insertOne(req.body);
        if(data){
          res.status(200).json({message:"booking recorded!"});
        }
        client.close();
        }
    catch(error){
      console.log(error);
      client.close();
    }
  }
})

app.listen(process.env.PORT || 5000, ()=>{
  console.log("app started!");
})