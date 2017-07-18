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
});

module.exports = {
  User,
};
