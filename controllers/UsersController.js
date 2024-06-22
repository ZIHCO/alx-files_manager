import sha1 from 'sha1';
import dbClient from '../utils/db';

export default class UsersController {
  static postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
    }
    try {
      const userExist = dbClient.db().collection('users').findOne({ email });
       const hashPassword = sha1(password);
       const newUser = dbClient
         .db()
         .collection('user')
         .insertOne({
           email,
           password: hashPassword,
         });
       response.status(201).json({
         id: newUser.insertedId,
         email,
       });
    } catch (_err) {
      response.status(400).json({ error: 'Already exist' });
    }
  }
}
