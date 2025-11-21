const express = require('express');
const dotenv=require('dotenv');
const userRouter = require('./routes/user');
const cors = require('cors');

const port=process.env.PORT || 3000;

const app=express();
dotenv.config();

app.use(express.json());
app.use(cors());

const allowedOrigins = [
  'http://localhost:5173',
  'https://stackofficial.vercel.app',
  'https://invest-more-money.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));



app.use('/api/v1/users',userRouter);

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})
