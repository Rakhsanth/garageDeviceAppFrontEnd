// 3rd party modules
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const expressMongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const preventXSS = require('xss-clean');
const expressRateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const colors = require('colors');
const errorHandler = require('errorhandler');
//core modules
const path = require('path');
//custom modules
const rootPath = require('./utils/rootPath');
const userRoutes = require('./routes/users');
const deviceRoutes = require('./routes/devices');
const connectDB = require('./config/db');
const mongoErrorHandler = require('./middlewares/mongoErrorHandler');
// Models

// configuring environment variables (for process.env using dotenv module)
dotenv.config({
    path: path.join(rootPath, 'config', 'config.env'),
});

// Connect to MongoDB
connectDB();

// use express
const app = express();

// .plugin error handler from express
app.use(errorHandler({ dumpExceptions: true, showStack: true }));
// Using the body parser from express to parse the body from request without that chunk and buffer
app.use(express.json());

// Enable CORS (Cross Origin Resource Sharing)
app.use(
    cors({
        credentials: true,
        origin: [
            'http://localhost:3000',
            'https://garage-device-app-ui.vercel.app',
        ],
    })
);

// This will add the cookie parsing functionlity and enables to get and send cookie on req and res.
app.use(cookieParser());

// enable logging on dev mode
if (process.env.NODE_ENV === 'dev') {
    app.use(morgan('dev'));
}

app.use(fileupload()); // File uploading express middleware to get files from client.

// serving static content like documention
app.use(express.static(path.join(rootPath, 'public')));

app.use(expressMongoSanitize()); // to prevent NOSQL injection

app.use(helmet()); // To add security headers

app.use(preventXSS()); // to prevent XSS

// API rate limiting
const rateLimiter = expressRateLimit({
    windowMs: 1 * 60 * 1000, // For 1 minute
    max: process.env.API_LIMIT,
    message: 'exceeded the API limit. Please try after few minutes.',
});
app.use(rateLimiter); // Plugging in the rate limiter

app.use(hpp()); // prevent http parameter pollution

// listening for specific API routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/devices', deviceRoutes);

// error handling middleware. This recieves the next() from the above router middlewares and handles all errors.
app.use(mongoErrorHandler);

const PORT = process.env.PORT || 3010;
const server = app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port : ${PORT}`
            .yellow.bold
    );
});

// As we are using async and await, promises with then and err are not handeled so, we can handle them
// globally as below by just logging them for now.
process.on('unhandledRejection', (error, promise) => {
    console.log(`Error: ${error.message}`.red);
    // close server and exit the process.
    server.close(() => {
        // To make our app crash when some promises fail by logging the promise errors
        process.exit(1);
    });
});

process.on('uncaughtException', function (exception, promise) {
    console.log(exception);
    server.close(() => {
        // To make our app crash when some promises fail by logging the promise errors
        process.exit(1);
    });
});
