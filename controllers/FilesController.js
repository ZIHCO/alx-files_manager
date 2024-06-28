import { ObjectID } from 'mongodb';
import { v4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class FilesController {
  static async postUpload(request, response) {
    const userId = await redisClient.get(`auth_${request.get('X-Token')}`);
    if (!userId) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, type } = request.body;
    const parentId = request.body.parentId || 0;
    const isPublic = request.body.isPublic || false;
    let data;
    if (type === 'file' || type === 'image') {
      data = request.body.data;
    }
    if (!name) {
      response.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!type || !(['file', 'folder', 'image'].includes(type))) {
      response.status(400).json({ error: 'Missing type' });
      return;
    }
    if (!data && type !== 'folder') {
      response.status(400).json({ error: 'Missing data' });
      return;
    }
    let fileExist;
    if (parentId !== 0) {
      fileExist = await dbClient.filesCollection.findOne({ _id: ObjectID(parentId) });
      if (!fileExist) {
        response.status(400).json({ error: 'Parent not found' });
        return;
      }

      if (fileExist.type !== 'folder') {
        response.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }
    if (type === 'folder') {
      const newFolder = await dbClient.filesCollection.insertOne({
        userId: ObjectID(userId),
        name,
        type,
        isPublic,
        parentId,
      });
      response.status(201).json({
        id: newFolder.insertedId,
        userId: ObjectID(userId),
        name,
        type,
        isPublic,
        parentId,
      });
      return;
    }

    // Make directory to  store file
    const dirPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const file = v4().toString();
    const localPath = path.join(dirPath, file);
    const dataToWrite = Buffer.from(data, 'base64');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(localPath, dataToWrite);
    // Write to file named uuid()
    const newFile = await dbClient.filesCollection.insertOne({
      userId: ObjectID(userId),
      name,
      type,
      isPublic,
      parentId,
      localPath,
    });
    response.status(201).json({
      id: newFile.insertedId,
      userId: ObjectID(userId),
      name,
      type,
      isPublic,
      parentId,
    });
  }

  static async getShow(request, response) {
    const userId = redisClient.get(`auth_${request.get('X-Token')}`);
    if (!userId) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const fileExist = await dbClient.filesCollection.findOne({
      _id: ObjectID(request.params.id),
    });
    if (!fileExist) {
      response.status(404).json({ error: 'Not found' });
      return;
    }
    response.status(201).json(fileExist);
  }

  static async getIndex(request, response) {
    const userId = await redisClient.get(`auth_${request.get('X-Token')}`);
    if (!userId) return response.status(401).json({ error: 'Unauthorized' });

    const parentId = request.query.parentId || 0;
    const page = parseInt(request.query.page, 10) || 1;
    const skip = (page - 1);
    const pipeline = [];

    const totalDocuments = await dbClient.filesCollection.countDocuments(
      (parentId ? { parentId } : {}),
    );
    const totalPages = Math.ceil(totalDocuments / 10);
    if (page > totalPages || page < 1) return response.status(400).json();

    if (parentId) {
      pipeline.push({
        $match: {
          parentId,
        },
      });
    }
    pipeline.push(
      {
        $sort: { _id: 1 },
      },
      { $skip: skip },
      { $limit: 10 },
    );
    const result = await dbClient.filesCollection.aggregate(pipeline).toArray();
    return response.status(201).json(result);
  }
}
