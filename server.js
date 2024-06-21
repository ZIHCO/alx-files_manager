import express from 'express';
import router from './routes/index';

const server = express();

server.use('/', router);

const port = process.env.PORT || 5000;

server.listen(port, () => console.log('Server is running on port 5000\n...'));

export default server;
