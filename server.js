import express from 'express'
import cors from 'cors'
import http from 'http'
import connectDB from './database.js'
import { Server } from 'socket.io'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// WebSocket Configuration
const server = http.createServer(app)
const io = new Server(server, {
    cors : {
        origin : "http://localhost:5173",
        methods : ["GET", "POST"]
    }
})

// Routes
app.post('/placebid', async (req, res) => {
    try {
        const { user, bid, product_name } = req.body
        const db = await connectDB()

        let [result] = await db.execute(`
    insert into biddings(name,bid,product_name) values(?,?,?)`, [user, bid, product_name]);

        io.emit("bidPlaced", { user, bid, product_name })
        res.json({ success: true, insertId: result.insertId })
        console.log("Inserted:", result);
    }
    catch(error){
        console.error("Error inserting Bid ", error)
        res.status(500).json({error : "Failed to place Bid"})
    }
})

app.get('/highestbid', async(req,res) => {
    try{
        const db = await connectDB()
        let [result] = await db.execute(`
         select * from biddings ORDER BY bid DESC `)
         res.json(result)
         console.log("Highest Bids fetched : ", result)
    }
    catch(error){
        console.error("Error fetching Highest Bids", error)
        res.status(500).json({error: "Unable to fetch Highest Bids"})
    }
})

app.get('/lastbids', async(req,res) => {
    try{
        const db = await connectDB()
        let [result] = await db.execute(`
         select * from biddings ORDER BY id DESC `)
         res.json(result)
         console.log("Last Bids fetched :", result)
    }
    catch(error){
        console.error("Unable to fetch Last biddings", error)
        res.status(500).json({error : "Unable to fetch last bids"})
    }
})

app.get('/user-bids/:username', async(req,res)=>{
    try{
        const {username} = req.params
        const db = await connectDB()

        let [rows] = await db.execute(`select product_name from biddings where name = ?`,[username])
        res.json(rows.map(r => r.product_name))
    }
    catch(error){
        console.error("Error fetching user bids", error)
        res.status(500).json({error:"Failed to fetch user bids"})
    }
})

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

server.listen(PORT, () => {
    console.log("Server is running on Port : ", PORT)
})