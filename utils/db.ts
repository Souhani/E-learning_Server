import mongoose from "mongoose";
require('dotenv').config();

const dbURL:string = process.env.DB_URL || '';

const connectDb = async() => {
    try {
      await mongoose.connect(dbURL)
      .then((data:any) => {
        console.log(`Database connected with ${data.connection.host}`)
      })
    } catch(error:any) {
      console.log('error while connnecting to the database: ', error.message);
       setTimeout(connectDb, 5000)
    }  
}

export default connectDb;