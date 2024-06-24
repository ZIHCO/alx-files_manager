import sha1 from 'sha1';
import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(request, response) {
    const auth = request.get('Authorization');
    const decodeAuth = Buffer.from(
      auth.slice(auth.indexOf(' ') + 1), 'base64'
    ).toString('utf-8');
    const email = decodeAuth.slice(0, decodeAuth.indexOf(':'));
    const password = decodeAuth.slice(decodeAuth.indexOf(':') + 1);

    const userExist = await dbClient.usersCollection.findOne({
      email, password: sha1(password),
    });
    if (!userExist) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = v4();
    redisClient.set(
      `auth_${token}`, userExist._id.toString(), (60 * 60 * 24),
    );
    response.status(200).json({ token });
  }

  static async getDisconnect(request, response) {
    const userId = await redisClient.get(`auth_${request.get('X-TOKEN')}`);
    if (!userId) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    redisClient.del(`auth_${request.get('X-Token')}`);
    response.status(204).json();
  }
}
