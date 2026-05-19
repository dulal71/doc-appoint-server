const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
const appointmentList = db.collection("appointmentDoctors")
   
//get all data 
app.get('/doctors',async(req,res)=>{
  const cursor=await doctors.find()
  const result = await cursor.toArray()
  res.send(result)
})

// get data by id
app.get('/doctors/:id',async(req,res)=>{
const id = req.params.id
console.log(id);
const query={
  _id : new ObjectId(id)
}
 const result = await doctors.findOne(query)
  res.send(result)
})

//add appointment data 
app.post('/appointmentDoctors',async(req,res)=>{
  const appointmentData=req.body
  console.log(appointmentData);
const result = await appointmentList.insertOne(appointmentData)
res.send(result)

})

app.get('/appointmentDoctors/:id',async(req,res)=>{
   try{
const userId=req.params.id
  const result = await appointmentList.find({userId}).toArray()
  res.send(result)
   }catch(error){
      res.status(500).send({ error: error.message });
   }
  
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
