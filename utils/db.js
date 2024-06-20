import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    this.clientIsConnected = true;
    this.client = new MongoClient(`mongodb://${host}:${port}/${database}`,
      { useUnifiedTopology: true });
    this.client.connect()
      .then(() => {
        this.clientIsConnected = true;
      })
      .catch(() => {
        this.clientIsConnected = false;
      });
  }

  isAlive() {
    return this..client.isConnected();
  }

  async nbUsers() {
    const users = await this.client.db().collection('users');
    return users.countDocuments();
  }

  async nbFiles() {
    const files = await this.client.db().collection('files');
    return files.countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
