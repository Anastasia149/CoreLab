require('dotenv').config()

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./db');
const router = require('./router/index');
const errorMiddleware = require('./middlewares/error-middleware')

const fileUpload = require('express-fileupload');

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}
));
app.use(express.static('static'));
app.use(fileUpload({}));
app.use('/api', router);
app.use(errorMiddleware);


const start = async () => {
    try {
        await pool.query('SELECT 1');
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
        
    } catch (e) {
        console.log(e);
    }
}

start()
