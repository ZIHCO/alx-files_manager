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
    dbClient.getExistingUser(email)
      .then((data) => {
        if (data) {
          throw new Error('Already exist');
        }
      })
      .catch((error) => {
        response.status(400).json({ error: error.message });
      });
    const newUser = dbClient.addNewUser({
      email,
      password: sha1(password),
    });
    newUser
      .then((data) => {
        response.status(201).json({
          id: data.ops[0]._id,
          email,
        });
      });
  }
}
