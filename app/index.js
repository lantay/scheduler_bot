import { RtmClient } from '@slack/client';
import google from 'googleapis';
import express from 'express';
import bodyParser from 'body-parser';
import moment from 'moment';
import { User, Reminder } from './models';
import './bot';

const botToken = process.env.BOT_TOKEN;
const rtm = new RtmClient(botToken);
const OAuth2 = google.auth.OAuth2;


function getGoogleAuth() {
  return new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'http://localhost:3000/connect/callback');
}
console.log(getGoogleAuth);

let tunnelUrl;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('hi  ');
});

app.post('/slack/interactive', (req, res) => {
  console.log('enters post slack')
  const payload = JSON.parse(req.body.payload);
  if (payload.actions[0].value === 'true') {
    User.findOne({ slackId: payload.user.id })
      .then((user) => {
        console.log('user found');
        const googleAuth = getGoogleAuth();
        const credentials = Object.assign({}, user.google);
        delete credentials.profile_id;
        delete credentials.profile_name;
        googleAuth.setCredentials(credentials);
        console.log('credentials set');
        const calendar = google.calendar('v3');
        calendar.events.insert({
          auth: googleAuth,
          calendarId: 'primary',
          resource: {
            summary: user.pending.task,
            start: {
              date: user.pending.date,
              timeZone: 'America/Los_Angeles',
            },
            end: {
              date: user.pending.date,
              timeZone: 'America/Los_Angeles',
            },
          },
        }, (err) => {
          const newReminder = new Reminder({
            task: user.pending.task,
            date: user.pending.date,
            userSlackId: user.slackId,
          });
          console.log('this is the reminder', newReminder);
          newReminder.save();
          user.pending = {}; // eslint-disable-line
          user.save();
          console.log('theoretically clearing', user.pending);
          if (err) {
            console.log('this is err:', err);
            res.send('There was an error creating reminder', err);
          } else {
            // console.log('user', user);
            console.log('created successfully');
            res.send('Created reminder :white_check_mark:');
          }
        });
      }).catch((err) => {
        console.log('ERR:', err);
      });
  } else {
    res.send('Cancelled :x:');
    User.findOne({ slackId: payload.user.id })
      .then((user) => {
        user.pending.task = ''; // eslint-disable-line
        user.pending.date = ''; // eslint-disable-line
        console.log('user should have pending cleared', user);
        user.save();
      });
  }
});

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'];
app.get('/connect', (req, res) => {
  console.log('getting here');
  const userId = req.query.user;
  if (!userId) {
    res.status(400).send('Missing user id');
  } else {
    User.findById(userId)
      .then((user) => {
        if (!user) {
          res.status(404).send('Cannot find user');
        } else {
          const googleAuth = getGoogleAuth();
          const url = googleAuth.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: GOOGLE_SCOPES,
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
              rtm.sendMessage('You are connected to Google Calendar' + mongoUser.slackDmId);
            });
        }
      });
    }
  });
});

app.listen(3000, (err, url) => {
  if (err) {
    console.log(err);
  } else {
    tunnelUrl = url;
    console.log(tunnelUrl);
  }
});
