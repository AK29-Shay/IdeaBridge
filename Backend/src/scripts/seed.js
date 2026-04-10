import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import Project from '../models/Project.js';
import Request from '../models/Request.js';
import Activity from '../models/Activity.js';
import { projects, requests, activity } from '../data/seedData.js';

dotenv.config();

const importData = async () => {
  await connectDB();

  await Promise.all([
    Project.deleteMany(),
    Request.deleteMany(),
    Activity.deleteMany()
  ]);

  await Promise.all([
    Project.insertMany(projects),
    Request.insertMany(requests),
    Activity.insertMany(activity)
  ]);

  console.log('Seed data imported');
  process.exit(0);
};

const destroyData = async () => {
  await connectDB();

  await Promise.all([
    Project.deleteMany(),
    Request.deleteMany(),
    Activity.deleteMany()
  ]);

  console.log('Seed data removed');
  process.exit(0);
};

const run = async () => {
  try {
    if (process.argv.includes('--destroy')) {
      await destroyData();
      return;
    }

    await importData();
  } catch (error) {
    console.error(`Seed script failed: ${error.message}`);
    process.exit(1);
  }
};

run();
