import express from 'express';
import bodyParser from 'body-parser';
import ngrok from 'ngrok';
import google from 'googleapis';
import './bot';
import User from './models';

const OAuth2 = 'google.auth.OAuth2';
console.log(google);

function getGoogleAuth() {
  return new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'http://localhost:3000/connect/callback');
}
console.log(getGoogleAuth);


let tunnelUrl;
console.log(GOOGLE_SCOPE);

ngrok.connect(3000, (err, url) => {
  if (err) {
    console.log(err);
  } else {
    tunnelUrl = url;
    console.log(tunnelUrl);
  }
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.post('/slack/interactive', (req, res) => {
  const payload = JSON.parse(req.body.payload);
  if (payload.actions[0].value === 'true') {
    res.send('Created reminder :white_check_mark:');
  } else {
    res.send('Cancelled :x:');
  }
});

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

app.get('/google/callback', function(req, res) {
  const googleAuth = getGoogleAuth();
  googleAuth.getToken(code, function (err, tokens) {
    if (!err) {
      oauth2Client.setCredentials(tokens);
    } else {
      res.json({
        code: req.query.code,
        state: req.query.state,
      });
    }

});
