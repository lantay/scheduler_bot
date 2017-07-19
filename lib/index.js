import { RtmClient } from '@slack/client';
import express from 'express';
import bodyParser from 'body-parser';
import ngrok from 'ngrok';
import { User } from './models';
import './bot';
// import google from 'googleapis';

const botToken = process.env.SCHEDULER_BOT_TOKEN;
const rtm = new RtmClient(botToken);
const OAuth2 = 'google.auth.OAuth2';


function getGoogleAuth() {
  return new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'http://localhost:3000/connect/callback');
}
console.log(getGoogleAuth);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'];
app.get('/connect', (req, res) => {
  const userId = req.query.user;
  if (!userId) {
    res.status(400).send('Missing user id');
  } else {
    User.findById(userId)
      .then((user) => {
        if (!user) {
          res.status(404).send('Cannot find user');
        } else {
          const googleAuth = getGoogleAuth;
          const url = googleAuth.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scopes: GOOGLE_SCOPES,
            state: userId,
          });
          res.redirect(url);
        }
      });
  }
});

app.get('/connect/callback', (req, res) => {
  const googleAuth = getGoogleAuth();
  googleAuth.getToken(req.query.code, (err, tokens) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      googleAuth.setCredentials(tokens);
      const plus = google.plus('v1');
      plus.people.get({ auth: googleAuth, userId: 'me' }, (error, googleUser) => {
        if (error) {
          res.status(500).json({ err: error });
        } else {
          User.findById(req.query.state)
            .then((mongoUser) => {
              mongoUser.google = tokens; // eslint-disable-line
              mongoUser.google.profile_id = googleUser.id; // eslint-disable-line
              mongoUser.google.profile_name = google.displayName;  // eslint-disable-line
              return mongoUser.save();
            })
            .then((mongoUser) => {
              res.send('You are connected to Google Calendar');
              rtm.sendMessage('You are connected to Google Calendar', mongoUser.slackDmId);
            });
        }
      });
    }
  });
});

app.post('/interactive', (req, res) => {
  const payload = JSON.parse(req.body.payload);
  console.log(payload);
  if (payload.actions[0].value === 'true') {
    res.send('Created reminder :white_check_mark:');
  } else {
    res.send('Cancelled :x:');
  }
});

app.listen(3000);
