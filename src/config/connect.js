import mongoose from "mongoose"


const connectDB = async (uri) => {
    try {
        mongoose.connect(uri);
        console.log("Database connection suceesful!")
    } catch (error) {
        console.log("Database connection failed!",error);
        
    }
}

export default connectDB;