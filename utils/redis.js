import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.clientIsConnected = true;
    this.client = createClient()
      .on('error', (err) => {
        console.error(err);
        this.clientIsConnected = false;
      }).on('connect', () => {
        this.clientIsConnected = true;
      });
  }

  isAlive() {
    return (this.clientIsConnected);
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return (getAsync(key));
  }

  async set(key, value, duration) {
    await promisify(this.client.setex).bind(this.client)(key, duration, value);
  }

  async del(key) {
    await promisify(this.client.del).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
