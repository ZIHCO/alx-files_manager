import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }

    const userExist = await dbClient.usersCollection.findOne({ email });
    if (userExist) {
      response.status(400).json({ error: 'Already exist' });
      return;
    }

    const newUser = await dbClient.usersCollection.insertOne({
      email, password: sha1(password),
    });
    response.status(201).json({ id: newUser.insertedId, email });
  }

  static async getMe(request, response) {
    const userId = await redisClient.get(`auth_${request.get('X-Token')}`);
    if (!userId) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const objectId = ObjectId(userId);
    const userFromDB = await dbClient.usersCollection.findOne({ _id: objectId });
    response.status(200).json({ id: userId, email: userFromDB.email });
  }
}
