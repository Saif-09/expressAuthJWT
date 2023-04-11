import dotenv from 'dotenv'
dotenv.config();
import connectDB from './config/connectdb.js'
import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

// import bodyParser from 'body-parser';

const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// app.use(bodyParser)
//CORS Policy
app.use(cors())

//Database Connection
connectDB(DATABASE_URL)

//API using JSON
app.use(express.json())

//Load Routes
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)

app.listen(port,()=>{
    console.log(`Server Listening at http://localhost:${port}`)
})