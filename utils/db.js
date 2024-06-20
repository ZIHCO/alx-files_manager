import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    this.clientIsConnected = true;
    this.client = new MongoClient(`mongodb://${host}:${port}`,
      { useUnifiedTopology: true });
    (async function run() {
      try {
        this.client.connect();
        this.clientIsConnected = true;
        this.db = this.client.db(database);
      } catch (_err) {
        this.clientIsConnected = false;
      }
    }());
  }

  isAlive() {
    return this.clientIsConnected;
  }

  async nbUsers() {
    try {
      const users = await this.db.collection('users');
      return users.countDocuments();
    } catch (err) {
      return (err);
    }
  }

  async nbFiles() {
    try {
      const files = await this.db.collection('files');
      return files.countDocuments();
    } catch (err) {
      return (err);
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
