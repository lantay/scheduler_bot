import express from 'express';
import bodyParser from 'body-parser';
import google from 'googleapis';
import ngrok from 'ngrok';
import './bot';

const OAuth2 = google.auth.OAuth2;
let tunnelUrl;

ngrok.connect(3000, (err, url) => {
  if (err) {
    console.log(err);
  }
  tunnelUrl = url;
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.post('/slack/interactive', (req, res) => {
  res.send('Received :fire:');
});


app.get('/connect', (req, res) => {
  if (!req.query.auth_id) {

    }
})
