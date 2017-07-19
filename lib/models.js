const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

const User = mongoose.model('User', {
  slackId: {
    type: String,
    required: true,
  },
  slackDmId: {
    type: String,
    required: true,
  },
  google: {},
  date: String,
  description: String
});

const Reminder = mongoose.model('Reminder', {
  subject: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = {
  User,
  Reminder,
};
