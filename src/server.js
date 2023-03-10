import express from 'express';
import * as url from 'url';
import privateRoutes from './routes/private.js';
import publicRoutes from './routes/public.js';
import loginRoutes from './routes/login.js';
import { checkAuth } from './validate.js';
import * as dotenv from 'dotenv';


const app = express();
const staticPath = url.fileURLToPath(new URL('../static', import.meta.url));

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
};

app.use(express.json());
app.use(logger);
app.use(express.static(staticPath));
app.use('/api/public/', publicRoutes);
app.use('/api/private/', checkAuth, privateRoutes);
app.use('/api/login/', loginRoutes);


dotenv.config();
const port = process.env.port;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

