import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function connectDB(){
    try{
        const connection = await mysql.createConnection(process.env.DATABASE_URL)
        console.log("MYSQL Connected")
        return connection
    }
    catch(error){
        console.error("DB Connection failed : ", error)
    }
}

export default connectDB;