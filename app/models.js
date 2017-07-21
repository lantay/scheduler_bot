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
    title: String,
    time: String,
    invitees: String,
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

const Meeting = mongoose.model('Meeting', {
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  userSlackId: {
    type: String,
    required: true,
  },
  invitees: {
    type: String,
  },

});

module.exports = {
  User,
  Reminder,
  Meeting,
};

// unnecessary comment
