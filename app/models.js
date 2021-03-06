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
  pending: {
    date: String,
    task: String,
  },

});

const Reminder = mongoose.model('Reminder', {
  task: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  userSlackId: {
    type: String,
    required: true,
  },
});

module.exports = {
  User,
  Reminder,
};

// unnecessary comment
