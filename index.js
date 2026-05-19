// jodi database connect a pblm hoi....taile nicher 2 line ekhane likhe dibo
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const cors=require("cors")
const dotenv=require('dotenv')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
 
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

 const verifyToken=async(req,res,next)=>{
    const authHeader =req?.headers.authorization
    if(!authHeader){
      return res.status(401).json({message:"unauthorized"});
    }
    const token =authHeader.split(" ")[1]
    if(!token){
      return res.status(401).json({message:"unauthorized"});
    }
     
    try{
      const {payload}=await jwtVerify(token,JWKS)
    console.log(payload);
     next()

    }catch (error){
       return res.status(403).json({message:"Forbidden"});
    }
    
    
    }
    
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db=client.db("wanderlast")
    const destinationCollection=db.collection("destinations");
    const bookingCollection=db.collection("bookings");


    app.get("/destination",async(req,res)=>{
     const result =await destinationCollection.find().toArray();
     res.json(result);
    })

    app.get("/destination/:id", verifyToken,
    async(req,res)=>{
      const {id}=req.params
      const result =await destinationCollection.findOne({_id:new ObjectId(id)})

      res.json(result);
    })
    
     app.patch("/destination/:id",async(req,res)=>{
      const {id} =req.params
      const updatedData =req.body
      
      const result =await destinationCollection.updateOne(
        {_id:new ObjectId(id)},
        {$set:updatedData}
      )

     res.json(result)

    })

    app.post('/destination',verifyToken,async(req,res)=>{
      const destinationData=req.body
      console.log(destinationData);
      const result =await destinationCollection.insertOne(destinationData)

      res.json(result)
    })

     app.delete("/destination/:id",async(req,res)=>{
      const {id}=req.params;
      const result =await destinationCollection.deleteOne({_id:new ObjectId(id)})

      res.json(result);
    })

      app.post('/booking',async(req,res)=>{
      const bookingData=req.body;
      const result =await bookingCollection.insertOne(bookingData);

      res.json(result);
    })

    app.get('/booking/:userId',async(req,res)=>{
      const {userId} =req.params;
      const result =await bookingCollection.find({userId:userId}).toArray();

      res.json(result);
    })

    app.delete("/booking/:bookingId",async(req,res)=>{
      const {bookingId}=req.params;
      const result =await bookingCollection.deleteOne({_id:new ObjectId(bookingId)})

      res.json(result);
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})