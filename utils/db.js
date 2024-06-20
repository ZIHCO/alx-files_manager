import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.clientIsConnected = false;
    this.client = new MongoClient(`mongodb://${host}:${port}`,
      { useUnifiedTopology: true });
    this.client.connect()
    .then(() => {
      //console.log(this.clientIsConnected);
      this.db = this.client.db(database);
      this.clientIsConnected = true;
    })
    .catch((err) => {
      if (err) {
        this.clientIsConnected = false;
      }
    });
  }

  isAlive() {
    return this.clientIsConnected;
  }

  async nbUsers() {
    try {
      const users = await this.db.collection('users');
      return users.countDocuments();
    } catch (_err) {
      return;
    }
  }

  async nbFiles() {
    try {
      const files = await this.db.collection('files');
      return files.countDocuments();
    } catch (_err) {
      return;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
