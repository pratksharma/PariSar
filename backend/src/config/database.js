import config from "./config.js"
import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log("DB connected successfully")
    } catch (error) {
        console.log(error)
    }
}

export default connectDB;