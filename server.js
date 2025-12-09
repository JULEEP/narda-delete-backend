import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import connectDatabase from './db/connectDatabase.js';
import UserRoutes from './Routes/userRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// Middleware
// ---------------------------

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://dharmadhwajam-delete-frontend.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Cookies
app.use(cookieParser());

// File Upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

// ---------------------------
// Database Connection
// ---------------------------
connectDatabase();

// ---------------------------
// Static Files
// ---------------------------

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------
// Routes
// ---------------------------

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to our service!',
  });
});

// User Routes
app.use('/api/users', UserRoutes);

// ---------------------------
// Server Setup
// ---------------------------

const port = process.env.PORT || 6061;

const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
});
