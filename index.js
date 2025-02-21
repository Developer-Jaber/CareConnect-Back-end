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
    // await client.connect();

    // create collection here
    const campCollection = client.db('MadicalCamp').collection('MadicalCampCollection')
    const participantCollection = client.db('Participants').collection('all-participants')


    // create api for getting camp data
    app.get('/madical_camp', async (req, res) => {
      const result = await campCollection.find().toArray();
      res.send(result);
    })

    // create api for getting single camp data by id
    app.get('/madical_camp/:id', async (req, res) => {
      const id = req.params.id;
      const queiry = { _id: new ObjectId(id) };
      const result = await campCollection.findOne(queiry);
      res.send(result)
    })

    // create api for posting Participet join data
    app.post('/participants', async (req, res) => {
      const user = req.body;
      const result = await participantCollection.insertOne(user);
      res.send(result);
    })
    // create api for getting all Participet data
    app.get('/participants', async (req, res) => {
      const participet = req.body;
      const result = await participantCollection.find(participet).toArray();
      res.send(result);
    })
    app.get('/participants/:id', async (req, res) => {
      const id = req.params.id;
      const queiry = { _id: new ObjectId(id) };
      const result = await participantCollection.findOne(queiry);
      res.send(result)
    })
    app.get('/participants/email/:email', async (req, res) => {
      const email = req.params.email;
      const query = { participantEmail: email };
      const user = await participantCollection.find(query).toArray();
      res.send(user)
    })
    app.patch("/participants/:id", async (req, res) => {
      const { id } = req.params;
      const { paymentStatus, trxID } = req.body;
    
      const result = await participantCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { paymentStatus, trxID } }
      );
    
      if (result.modifiedCount > 0) {
        res.json({ success: true, message: "Payment updated successfully" });
      } else {
        res.status(400).json({ success: false, message: "No update made" });
      }
    });
    

    // create API route to increase the participant count
    app.patch('/madical_camp/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $inc: { participants: 1 } };

      const result = await campCollection.updateOne(query, update);

      if (result.matchedCount === 0) {
        return res.status(404).send({ error: "Camp not found" });
      }
      res.send({ message: "Participant count updated successfully" });
    });

    // -============================For Feedback========================-//
    // Feedback collection
    const feedbackCollection = client.db('MadicalCamp').collection('Feedback');

    // API to post feedback
    app.post('/feedback', async (req, res) => {
      const feedback = req.body; // {campId, participantName, feedback, rating, date}
      const result = await feedbackCollection.insertOne(feedback);
      res.send(result);
    });

    app.get('/feedback', async (req, res) => {
      const feedback = req.body; 
      const result = await feedbackCollection.find(feedback).toArray();
      res.send(result);
    });

    // API to get feedback for a specific camp
    app.get('/feedback/:campId', async (req, res) => {
      const { campId } = req.params;
      const result = await feedbackCollection.find({ campId }).toArray();
      res.send(result);
    });

    // -============================For Users========================-//
    // users collection
    const usersCollection = client.db('MadicalCamp').collection('users');

    // API to post users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const queiry = { email: user.email };
      const existingUser = await usersCollection.findOne(queiry);
      if (existingUser) {
        return res.send({ message: 'User alrady exist', insertedId: null })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // -============================For Organaiger========================-//
    // Create API for post a camp by organaiger
    app.post('/madical_camp', async (req, res) => {
      const newCamp = req.body;
      const result = await campCollection.insertOne(newCamp);
      res.status(201).send(result);
    });

    // -============================For getting admin========================-//
    app.get('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.find(user).toArray();
      res.send(result);
    })
    app.get('/users/:email', async (req, res) => {
      const { email } = req.params
      const user = await usersCollection.findOne({ email: email })
      res.send(user || {})
    })

    // -============================For manage camp========================-//
    app.delete('/delete-camp/:campId', async (req, res) => {
      const campId = req.params.campId
      const result = await campCollection.deleteOne({ _id: new ObjectId(campId) })
      res.send(result)
    })

    // -============================For manage resistered camp========================-//
    // for confirm
    app.patch('/confirm-payment/:campId', async (req, res) => {
      const campId = req.params.campId
      const result = await participantCollection.updateOne(
        { _id: new ObjectId(campId) },
        { $set: { confirmationStatus: 'Confirmed' } }
      )
      res.send(result)
    })
    // for cancell
    app.delete('/cancel-registration/:campId', async (req, res) => {
      const campId = req.params.campId
      const result = await participantCollection.deleteOne({ _id: new ObjectId(campId)})
      res.send(result)
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
  res.send('CareConect Camp server is running....!')
})

app.listen(port, () => {
  console.log(`CareConect Camp server is running on port: ${port}`);
})