import express from 'express';
import bodyParser from 'body-parser';
import './bot';

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.post('/slack/interactive', function (req, res) {
    var payload = JSON.parse(req.body.payload);
    if (payload.actions[0].value === 'true') {
        res.send('Created reminder :white_check_mark:');
    } else {
        res.send('Cancelled :x:');
    }
})
  
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

app.get('/connect', async function (req, res) {
    if (!req.query.auth_id) {

    }
})
