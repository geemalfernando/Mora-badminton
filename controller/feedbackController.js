const databaseWrapper = require('../database/databaseWrapper');

const addFeedback = async (req, res) => {
  const { feedbackData } = req.body;

  if (!feedbackData || typeof feedbackData !== 'object') {
    return res.status(400).send({ message: 'required data not filled', detail: 'feedbackData object missing' });
  }
  if (!feedbackData.firstName || !feedbackData.lastName || !feedbackData.email || !feedbackData.message || !feedbackData.sentDate) {
    return res.status(400).send({ message: 'required data not filled', detail: 'firstName, lastName, email, message, sentDate required' });
  }

  // Ensure sentDate is a Date so Mongoose accepts it
  const toSave = {
    ...feedbackData,
    sentDate: feedbackData.sentDate instanceof Date ? feedbackData.sentDate : new Date(feedbackData.sentDate),
  };

  try {
    return await databaseWrapper.add('feedback', toSave, res);
  } catch (err) {
    console.error('[feedbackController.addFeedback]', err);
    return res.status(500).send({ message: 'Server error', error: err?.message || String(err) });
  }
};

const getAllFeedbacks = async (req, res) => {
  const result = await databaseWrapper.read('feedback', res);
  res.status(201).send({ message: result.message, data: result.data });
};

const updateFeedback = async (req, res) => {
  try {
    const { field, value, data } = req?.body || {};
    console.log(field, value, data)
    //todo: data should validate

    if (!field || value==null || !data) {
      return res.status(400).send({ message: 'required data not filled' });
    }
    return await databaseWrapper.update('feedback', field, value, data, res);
  } catch (e) {
    return res.status(400).send({ message: 'Bad Request', error: e });
  }
};

const getFeedbacksNotViewed = async (req, res) => {
  const result = await databaseWrapper.read('feedback', res, ["hasViewed"], [false] );
  res.status(201).send({ message: result.message, data: result.data });
};

module.exports = {
  addFeedback,
  getAllFeedbacks,
  getFeedbacksNotViewed,
  updateFeedback,
};
