const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;



// add a middlewere
app.use(cors());
app.use(express.json());

// connect mongodb here


const uri = `mongodb+srv://${process.env.USERDB}:${process.env.USERPASS}@careconnectcamp.ttyty.mongodb.net/?retryWrites=true&w=majority&appName=CareConnectCamp`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create collection here
    const campCollection = client.db('MadicalCamp').collection('MadicalCampCollection')



    // create api for getting camp data
    app.get('/madical_camp',async(req,res)=>{
      const result = await campCollection.find().toArray();
      res.send(result);
    })

    app.get('/madical_camp/:id', async (req, res) => {
      const id = req.params.id;
      const queiry = { _id: new ObjectId(id) };
      const result = await campCollection.findOne(queiry);
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('CareConect Camp server is running....!')
})

app.listen(port,()=>{
    console.log(`CareConect Camp server is running on port: ${port}`);
})