const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
const dotenv=require('dotenv');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
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
   
    //  await client.connect();
const db=client.db('doctor-appoint-data')
const doctors=db.collection('doctors')
const bookedDoctor = db.collection("doctorBookings")
const appointmentList = db.collection("appointmentDoctors")
   
//authorization
const JWKS=createRemoteJWKSet(
  new URL(`${CLIENT_UR}/api/auth/jwks`)
)
const authorization=async(req,res,next)=>{
  const header = req?.headers.authorization
if(!header){
  return res.status(401).json({message:"unauthorized"})
}
  const token = header.split(" ")[1]

if(!token){
return res.status(401).json({message:"unauthorized"})
}
  try{
const {payload}=await jwtVerify( token ,JWKS)
console.log("payload",payload);
next()
  }catch(error){
   return res.status(401).json({message:"forbidden"})  
  }
}


//get all data 
app.get('/doctors', async(req,res)=>{
  try{
 const search = req.query.search
 const specialty= req.query.specialty
  console.log(search);
  console.log(specialty);
  let query={}
  if(search || specialty){
query.$or=[];
if(search){
   query.$or.push({
      name: { $regex: search, $options: "i" }
    });
}
 if (specialty) {
    query.$or.push({
      specialty: { $regex: specialty, $options: "i" }
    });
  }
  }
   const cursor=await doctors.find(query)
  const result = await cursor.toArray()
  res.send(result)
  }catch(error){
res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
 
})

// get data by rating
app.get('/topDoctors',async(req,res)=>{
  try{
 const result=await doctors.find().sort({rating:-1}).limit(3).toArray()
  
  res.send(result)
  }catch(error){
res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
  
})

// get data by id
app.get('/doctors/:id', async(req,res)=>{
const id = req.params.id

console.log(token);
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

//delete appoint

app.delete('/appointmentDoctors/:id',async(req,res)=>{
 try{
  const id = req.params.id;
  console.log(id);
 const query={
  _id : new ObjectId(id)
}
  const result= await appointmentList.deleteOne(query)
  res.send(result)
 } catch(error){
   res.status(500).send({
      success: false,
      message: "Failed to delete booking",
    });
 }
})

// update appoint
app.patch('/appointmentDoctors/:id',async(req,res)=>{
 try{
const updateData = req.body
 const id = req.params.id;
 const filter={
  _id:new ObjectId(id)
 }
 const update={
  $set:updateData
 }
 console.log(updateData);
 const result=await appointmentList.updateOne(filter,update)
res.send(result)
 }catch(error){
res.status(500).send({
      success: false,
      message: "Failed to delete booking",
    });
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
