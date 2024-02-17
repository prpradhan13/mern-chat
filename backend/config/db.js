import mongoose from "mongoose";

const connectDB = async (req, res) => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI)
    } catch (error) {
        process.exit(1);
    }
}

export default connectDB;