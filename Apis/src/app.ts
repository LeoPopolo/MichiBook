import express, { Application } from 'express';
import morgan from 'morgan';

const app: Application = express();

import userRoutes from './routes/user';
// settings

app.set('port', 3000);

// middlewares

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method,');
    res.header('content-type: application/json; charset=utf-8')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    res.header('Access-Control-Expose-Headers', 'Authorization');
    next()
})
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/user', userRoutes);

export default app;