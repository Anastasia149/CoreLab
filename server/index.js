require('dotenv').config()

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./db');
const router = require('./router/index');
const errorMiddleware = require('./middlewares/error-middleware')

const fileUpload = require('express-fileupload');
const path = require('path');

const STATIC_INLINE_EXTENSIONS = new Set([
    '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp',
    '.mp4', '.webm', '.ogg', '.mov', '.m4v',
]);

const PORT = process.env.PORT || 5000
const app = express()

// Профиль с фото (data URL) и длинными текстами превышает дефолт 100kb
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '15mb';
app.use(express.json({ limit: jsonBodyLimit }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}
));
app.use(express.static('static', {
    setHeaders(res, filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (STATIC_INLINE_EXTENSIONS.has(ext)) {
            res.setHeader('Content-Disposition', 'inline');
        }
    },
}));
app.use(fileUpload({ uriDecodeFileNames: true }));
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
