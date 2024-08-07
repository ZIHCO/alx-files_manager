import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AppController {
  static getStatus(request, response) {
    response.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  static async getStats(request, response) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    response.status(200).json({ users: usersCount, files: filesCount });
  }
}
