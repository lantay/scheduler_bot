import express from 'express';
import bodyParser from 'body-parser';
import ngrok from 'ngrok';
import google from 'googleapis';
import './bot';

const OAuth2 = 'google.auth.OAuth2';

function getGoogleAuth() {
  return new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/connect/callback'
  );
}

const GOOGLE_SCOPE = ['https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'];
let tunnelUrl;

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
