import express from 'express';
import bodyParser from 'body-parser';
// import google from 'googleapis';
import ngrok from 'ngrok';
import './bot';

<<<<<<< HEAD
const botToken = 'xoxb-213438509521-UXxoYGl92QnwQiaPOsF2cxB6';
=======
// const OAuth2 = google.auth.OAuth2;
let tunnelUrl;
>>>>>>> da0986dab209a5a17eea72038320d5ac64282381

ngrok.connect(3000, (err, url) => {
  if (err) {
    console.log(err);
  } else {
    tunnelUrl = url;
    console.log(tunnelUrl);
  }
});
// console.log(OAuth2);

const app = express();

<<<<<<< HEAD
let msg = 'not';
// The client will emit an RTM.AUTHENTICATED event on successful connection,
//    with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  rtmStartData.channels.forEach((c) => {
    channels[c.name] = c;
  });
});
=======
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
>>>>>>> da0986dab209a5a17eea72038320d5ac64282381


app.post('/slack/interactive', (req, res) => {
  const payload = JSON.parse(req.body.payload);
  if (payload.actions[0].value === 'true') {
    res.send('Created reminder :white_check_mark:');
  } else {
    res.send('Cancelled :x:');
  }
  msg = message;
  console.log(message);
});
<<<<<<< HEAD

console.log(msg);
rtm.start();

export default msg;
=======
>>>>>>> da0986dab209a5a17eea72038320d5ac64282381
