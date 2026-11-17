import mongoose from "mongoose";
import appointmentModel from "../models/appointments.model.js";
import userModel from "../models/users.model.js";

const appointmentSlotIndexKey = {
  doctor: 1,
  appointmentDate: 1,
  appointmentTime: 1,
};

function isAppointmentSlotIndex(index) {
  return JSON.stringify(index.key) === JSON.stringify(appointmentSlotIndexKey);
}

function hasExpectedPartialFilter(index) {
  const statuses = index.partialFilterExpression?.status?.$in;
  return index.unique === true
    && Array.isArray(statuses)
    && statuses.length === 2
    && statuses.includes("pending")
    && statuses.includes("approved");
}

async function ensureAppointmentSlotIndex() {
  const collection = appointmentModel.collection;
  const collectionExists = await mongoose.connection.db
    .listCollections({ name: collection.collectionName }, { nameOnly: true })
    .hasNext();
  if (!collectionExists) {
    await appointmentModel.createCollection();
  }

  const indexes = await collection.indexes();

  for (const index of indexes) {
    if (isAppointmentSlotIndex(index) && !hasExpectedPartialFilter(index)) {
      await collection.dropIndex(index.name);
    }
  }

  await appointmentModel.createIndexes();
}

async function ensureUserIndexes() {
  const collection = userModel.collection;
  const collectionExists = await mongoose.connection.db
    .listCollections({ name: collection.collectionName }, { nameOnly: true })
    .hasNext();
  if (!collectionExists) {
    await userModel.createCollection();
  }

  const indexes = await collection.indexes();
  for (const index of indexes) {
    const isLegacyUsernameIndex = JSON.stringify(index.key) === JSON.stringify({ username: 1 })
      && index.unique === true;
    if (isLegacyUsernameIndex) {
      await collection.dropIndex(index.name);
    }
  }

  await userModel.createIndexes();
}

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI must be configured.");
  }
  await mongoose.connect(uri);
  await ensureUserIndexes();
  await ensureAppointmentSlotIndex();
  console.log("Connected to MongoDB.");
}
