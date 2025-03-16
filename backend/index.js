import express from "express";
import dotenv from 'dotenv'
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import cors from 'cors'

dotenv.config()
// database connection

const app = express();
const port = 8000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));



mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('MongoDb connected'))
.catch((err)=>console.log('MongoDb not connected'))

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))


app.use("/", authRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}`));