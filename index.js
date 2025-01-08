import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import http from 'http'
import dotenv from 'dotenv'
import ConnectDB from './connectdb.js'
import { login, createUser, logout, verification,sendMail } from './services.js'
import Auth from './auth.js'
import multer from 'multer'
import cron from 'node-cron'
import nodemailer from "nodemailer"

import { User } from 'buzzy-schemas'

dotenv.config();
ConnectDB()

const app = express()



app.get('/emailsending',async(req,res)=>{
    const users = await User.find({}, { email: 1});
    const emails = users.map(user => user.email);

    await sendMail(emails, "service active")
    res.send(`email sent successfully to ${emails}`)
})

cron.schedule("0 7 * * *", async () => {

    const users = await User.find({}, { email: 1 });
    const emails = users.map(user => user.email);

    sendMail(emails, "service start")
    

})


cron.schedule("0 19 * * *", async () => {

    const users = await User.find({}, { email: 1 });
    const emails = users.map(user => user.email);

    sendMail(emails, "service stop")
})

app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())


app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
        'http://localhost:5174',
        'http://localhost:5173',
        'https://buzzzy.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const upload = multer({ storage: multer.memoryStorage() });


app.get('/', (req, res) => {
    res.send('Hello this is Authantication server!');
});
app.post('/api/auth/login', login)
app.post('/api/auth//signup', upload.single('file'), createUser)
app.post('/api/auth/logout', Auth, logout)
app.get('/api/auth/verifyToken', verification)

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
