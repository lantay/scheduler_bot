import express from 'express';
import bodyParser from 'body-parser';
import './bot';

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.post('/slack/interactive', (req, res) => {
    res.send('Received :fire:');
});

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

app.get('/connect', async function (req, res) {
    if (!req.query.auth_id) {

    }
})
