const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
const dotenv=require('dotenv')
const port =process.env.PORT || 5000
dotenv.config()
app.use(express.json())
app.use(cors())
const uri=process.env.MONGODB_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();
const db=client.db('doctor-appoint-data')
const doctors=db.collection('doctors')
const bookedDoctor = db.collection("doctorBookings")
   
//get all data 
app.get('/doctors',async(req,res)=>{
  const cursor=await doctors.find()
  const result = await cursor.toArray()
  res.send(result)
})




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
