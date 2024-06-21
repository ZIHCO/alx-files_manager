import router from './routes/index';
import express from 'express';

const server = express();

server.use('/status', router);

server.use('/stats', router);

const port = process.env.PORT || 5000;

server.listen(port, () => console.log('Server is running on port 5000\n...'));

export default server;
