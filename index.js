const express = require('express'); 
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require ('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dedsmmq.mongodb.net/?retryWrites=true&w=majority`;

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

    const usersCollection = client.db('autoTech').collection('users');
    const serviceCollection = client.db('autoTech').collection('services');
    const bookingCollection = client.db('autoTech').collection('bookings');
    const cartCollection = client.db('autoTech').collection('carts');
    //users related apis
    app.get('/users', async(req, res) =>{
      const result = serviceCollection.find().toArray();
      res.send(result);
      // console.log(result)
    })

    app.post('/users', async(req, res) =>{
      const user = req.body;
      const result = await usersCollection.insertOne(user)
      res.send(result);
    })

    // menu related apis
    app.get('/services', async(req, res) =>{
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      // console.log(result)
    })

    app.get('/service/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const options = {
        projection: {title: 1, top: 1, description: 1, detailDescription: 1, img: 1},
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });

    //appointments
    app.get('/appointments', async(req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    app.get('/myappointments', async(req, res) =>{
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/appointments', async(req, res) =>{
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.patch("/appointments", async(req, res) =>{
      const updateAppointments = req.body;
    })

    app.delete('/appointments/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    //Technitian------------------------
    app.get('/carts', async(req, res) =>{
      const email = req.query.email;
      if(!email){
        res.send([]);
      }
      const query = {email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    app.post('/carts', async(req, res) =>{
      const item = req.body;
      console.log(item);
      const result= await cartCollection.insertOne(item);
      res.send(result)
    })

    app.delete('/carts/:id', async (req, res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result);

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



app.get('/', (req, res) => { 
  res.send('AutoTech Server is running!');
})


app.listen(port, () => {
    console.log(`AutoTech Server is running on port ${port}`);
  })
