import './loadEnv.js';  
import express from "express"
import connectDB from "./config/connectDB.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.router.js"
import paymentRouter from "./routes/payment.router.js"


const app = express()
const allowedOrigins = [
  "http://localhost:5173",
  "https://intervai-1-qn0q.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)
app.use("/api/interview" , interviewRouter)
app.use("/api/payment" , paymentRouter)



const PORT = process.env.PORT ||6000
app.listen(PORT, ()=>{
    console.log(`server started at the port ${PORT}`)
    connectDB()
})
