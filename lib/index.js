import './bot';
import express from 'express';
import bodyParser from 'body-parser';
// import google from 'googleapis';
import ngrok from 'ngrok';

// const OAuth2 = google.auth.OAuth2;
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
