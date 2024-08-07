import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.clientIsConnected = true;
    this.client = createClient();
    this.client.on('error', (error) => {
      console.log(error);
      this.clientIsConnected = false;
    });
  }

  isAlive() {
    return this.clientIsConnected;
  }

  async get(key) {
    this.client.GET = promisify(this.client.GET);
    const result = await this.client.GET.bind(this.client)(key);
    return result;
  }

  async set(key, value, timer) {
    await promisify(this.client.SETEX).bind(this.client)(key, timer, value);
  }

  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
