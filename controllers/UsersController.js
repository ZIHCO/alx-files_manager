import sha1 from 'sha1';
import dbClient from '../utils/db';

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
}
