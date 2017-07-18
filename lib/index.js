import { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client';

const botToken = 'xoxb-213438509521-UXxoYGl92QnwQiaPOsF2cxB6';

const rtm = new RtmClient(botToken);
const web = new WebClient(botToken);

const channels = {};

let msg = 'not';
// The client will emit an RTM.AUTHENTICATED event on successful connection,
//    with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  rtmStartData.channels.forEach((c) => {
    channels[c.name] = c;
  });
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  rtm.sendMessage(`I am a working bot! ${new Date()}`, channels.general.id);
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  if (message.text === 'Hello.') {
    web.reactions.add('brian', {
      channel: message.channel,
      timestamp: message.ts,
    });
    rtm.sendMessage(`Hello <@${message.user}>!`, message.channel);
  }
  msg = message;
  console.log(message);
});

console.log(msg);
rtm.start();

export default msg;
