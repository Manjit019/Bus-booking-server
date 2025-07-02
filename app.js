import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './src/config/connect.js';
import { PORT } from './src/config/config.js';
import userRoutes from './src/routes/user.js';
import busRoutes from './src/routes/bus.js';
import ticketRoutes from './src/routes/ticket.js';
import { buildAdminJS } from './src/config/setup.js';


dotenv.config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ['ContentType', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use("/user",userRoutes);
app.use("/bus",busRoutes);
app.use("/ticket",ticketRoutes);


const start = async () => {

    try {
        await connectDB(process.env.MONGO_URI);

        await buildAdminJS(app);

        app.listen(PORT, (err,addr) => {
            if(err){
                console.log(err);
            } else{
                console.log(`Server stated on http://localhost:${PORT}/admin`);
            }
        });

    } catch (error) {
        console.log("Something went wrong : ",error);    
    }
}

start();