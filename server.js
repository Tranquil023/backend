const express = require('express');
const dotenv=require('dotenv');
const userRouter = require('./routes/user');
const cors = require('cors');

const port=process.env.PORT || 3000;

const app=express();
dotenv.config();

app.use(express.json());
app.use(cors());

app.use(cors({
  origin: 'https://frontend-rosy-sigma-77.vercel.app',
  credentials: true, // if sending cookies/auth headers
}));



app.use('/api/v1/users',userRouter);

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})