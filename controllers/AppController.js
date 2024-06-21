import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AppController {
  static getStatus(request, response) {
    console.log(request);
    response.status(200).json({redis: redisClient.isAlive(), db: dbClient.isAlive()});
  }
  
  static getStats(request, response) {
    response.status(200).json({users: dbClient.nbUsers(), files: dbClient.nbFiles()});
  }
}
