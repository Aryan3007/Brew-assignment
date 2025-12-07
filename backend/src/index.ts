import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174', // Vite fallback
        'http://localhost:3000', // React default
        'https://brew-assignment-ten.vercel.app', // Frontend Producion
        'https://brew-assignment-npad.vercel.app' // Backend Production (self)
    ],
    credentials: true, // Allow cookies
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: 'running', message: 'API is up and running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
