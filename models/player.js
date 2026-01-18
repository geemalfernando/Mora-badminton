const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
  },
  institute: {
    type: String,
    required: true,
  },
  pastPerformanceSingle: [
    {
      name: {
        type: String,
      },
      level: {
        type: String,
      },
      place: {
        type: String,
      },
    },
  ],
  pastPerformanceDouble: [
    {
      name: {
        type: String,
      },
      level: {
        type: String,
      },
      place: {
        type: String,
      },
    },
  ],
  performanceThreshold: {
    type: Number,
  },
  rank: {
    type: Number,
  },
  gender: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  registrationNumber: {
    type: String,
  },
  photo: {
    type: String,
  },
  year:{
    type:String
  }
});

playerSchema.index({ contactNumber: 1 });

module.exports = mongoose.model('Player', playerSchema);
