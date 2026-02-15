const playerSchema = require('../models/player');
const singleSchema = require('../models/single');
const ageGroupSchema = require('../models/ageGroup');
const captainSchema = require('../models/captain');
const companySchema = require('../models/company');
const doubleSchema = require('../models/double');
const matchForDrawSchema = require('../models/matchForDraw');
const matchResultSchema = require('../models/matchResult');
const subTournementSchema = require('../models/subTournement');
const teamRoundSchema = require('../models/teamRound');
const tournementSchema = require('../models/tournement');
const universitySchema = require('../models/university');
const userSchema = require('../models/user');
const yearlyConfigurationsSchema = require('../models/yearlyConfigurations');
const feedbackSchema = require('../models/feedback');
const photoSchema = require('../models/photo');
const mongoose = require('mongoose');

const schemas = {
  player: playerSchema,
  single: singleSchema,
  ageGroup: ageGroupSchema,
  captain: captainSchema,
  company: companySchema,
  double: doubleSchema,
  matchForDraw: matchForDrawSchema,
  matchResult: matchResultSchema,
  subTournement: subTournementSchema,
  teamRound: teamRoundSchema,
  tournement: tournementSchema,
  university: universitySchema,
  user: userSchema,
  yearlyConfigurations: yearlyConfigurationsSchema,
  feedback: feedbackSchema,
  photo: photoSchema,
};

const add = async (collectionName, data, res) => {
  try {
    const Model = schemas[collectionName];
    if (!Model) {
      console.error('[databaseWrapper.add] unknown collection:', collectionName);
      return res.status(500).send({ message: 'Server error', error: 'Unknown collection' });
    }
    const dbResponse = await Model.create(data);
    return res.status(201).send({ message: 'New Data has been added', data: dbResponse });
  } catch (e) {
    console.error('[databaseWrapper.add]', collectionName, e?.message || e);
    const errMsg = e?.message || (e?.errors ? JSON.stringify(e.errors) : String(e));
    res.status(500).send({ message: 'Server error', error: errMsg });
  }
};

const remove = async (collectionName, field, value, res) => {
  try {
    const filter = {};
    filter[field] = value;
    const dbResponse = await schemas[collectionName].findOneAndDelete(filter);
    res.status(200).send({ message: 'Data deleted successfully', data: dbResponse });
  } catch (e) {
    res.status(500).send({ message: 'Server error', error: e });
  }
};

const update = async (collectionName, field, value, data, res) => {
  try {
    const filter = {};
    filter[field] = value;
    const dbResponse = await schemas[collectionName].findOneAndUpdate(filter, data, {
      new: true,
    });
    if (dbResponse == null) {
      return res.status(400).send({ message: 'Invalid Inputs. Records not found' });
    } else {
      res.status(201).send({ message: 'Data has been updated', data: dbResponse });
    }
  } catch (e) {
    res.status(500).send({ message: 'Server error', error: e });
  }
};

const updateWithoutReturn = async (collectionName, field, value, data) => {
  try {
    const filter = {};
    filter[field] = value;
    const dbResponse = await schemas[collectionName].findOneAndUpdate(filter, data, {
      new: true,
    });
    if (dbResponse == null) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    return false;
  }
};

const read = async (collectionName, res, field = [], values = [], populate = false, path = '') => {
  try {
    const filter = {};
    for (let i = 0; i < field.length; i++) {
      filter[field[i]] = { $in: values[i] };
    }
    let dbResponse = null;
    
    if (!populate) {
      dbResponse = await schemas[collectionName].find(filter);
      return { message: 'Data retrieved successfully', data: dbResponse };
    } else {
      console.log('populated', path);
      dbResponse = await schemas[collectionName].find(filter).populate({
        path: path,
      });
    }

    console.log('DbRes:', dbResponse);
    return { message: 'Data retrieved successfully', data: dbResponse };
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: 'Server error', error: e });
  }
};

const readDoubles = async (collectionName, res, field = [], values = []) => {
  try {
    const filter = {};
    for (let i = 0; i < field.length; i++) {
      filter[field[i]] = { $in: values[i] };
    }
    const dbResponse = await schemas[collectionName].find(filter).populate('player').populate('playerPartner');
    return { message: 'Data retrieved successfully', data: dbResponse };
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: 'Server error', error: e });
  }
};

const isValidObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }
  return true;
};

const getAllFields = (schemaName) => {
  return Object.keys(schemas[schemaName].schema.paths);
};

const createAndUpdate = async (insertData, updateData, res) => {
  const session = await mongoose.startSession();
  try {
    const insertCollection = insertData.name;
    const toInsertData = insertData.data;
    const updateCollection = updateData.name;
    const toUpdateData = updateData.data;
    const filterField = updateData.filterField;
    session.startTransaction();
    const result = await schemas[insertCollection].create(toInsertData);
    await schemas[updateCollection].findOneAndUpdate({ _id: result[filterField].toString() }, toUpdateData);
    await session.commitTransaction();
  } catch (error) {
    console.log('Error during the transaction');
    await session.abortTransaction();
    await session.endSession();
    return res.status(500).send({ message: 'Server error', error: e });
  }
  await session.endSession();
  return true;
};

const atomicDualCreate = async (dataForFirstCollection, dataForSecondCollection, reuseField, res) => {
  const session = await mongoose.startSession();
  let finalResponse = null;
  let players = null;
  try {
    const firstCollection = dataForFirstCollection.name;
    const firstCollectionData = dataForFirstCollection.data;
    const secondCollection = dataForSecondCollection.name;
    const secondCollectionData = dataForSecondCollection.data;
    session.startTransaction();
    let result = await schemas[firstCollection].insertMany(firstCollectionData);
    if (result.length == 0) {
      return res.status(500).send({ message: 'Error in insert options provided' });
    } else {
      result = arrangeResult(result);
      players = result.details;
      secondCollectionData[reuseField] = Object.values(result.insertedIds);
      console.log(secondCollectionData);
      finalResponse = await schemas[secondCollection].create(secondCollectionData);
      console.log(finalResponse);
    }
  } catch (error) {
    console.log('Error during the transaction', error);
    await session.abortTransaction();
    await session.endSession();
    res.status(500).send({ message: 'Server error', error: e });
  }
  await session.endSession();
  console.log('success', finalResponse);
  return res.status(201).send({
    message: 'Data added successfully',
    data: finalResponse,
    players: players,
  });
};

function arrangeResult(result) {
  temp = { insertedIds: [], details: [] };
  for (const res of result) {
    temp.insertedIds.push(res._id);
    temp.details.push(res._id + ' : ' + res.firstName + ' | ' + res.lastName);
  }
  return temp;
}

module.exports = {
  add,
  remove,
  update,
  read,
  isValidObjectId,
  getAllFields,
  createAndUpdate,
  atomicDualCreate,
  readDoubles,
  updateWithoutReturn
};
