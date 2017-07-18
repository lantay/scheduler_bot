import { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client';
import axios from 'axios';

const botToken = 'xoxb-213438509521-5bm99kQd5JLJ7DDsHeIBgXPA';

const rtm = new RtmClient(botToken);
const web = new WebClient(botToken);

const channels = {};

let msg;
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
  const dm = rtm.dataStore.getDMByUserId(message.user);
  if (!dm || dm.id !== message.channel || message.type !== 'message') {
    console.log('MESSAGE NOT SENT TO DM, IGNORING');
    return;
  }
  msg = message;
  if (message.text === 'Hello.') {
    web.reactions.add('brian', {
      channel: message.channel,
      timestamp: message.ts,
    });
    rtm.sendMessage(`Hello <@${message.user}>!`, message.channel);
    axios.get('https://api.api.ai/api/query', {
      params: {
        v: 20150910,
        lang: 'en',
        timezone: '2017-07-17T16:55:33-0700',
        query: message.text,
        sessionId: message.user,
      },
      headers: {
        Authorization: 'Bearer a4bede1b2c974153af4e0548d6a09441',
      },
    })
      .then(({ data }) => {
        if (data.result.actionIncomplete) {
          console.log("actionincomplete");
          rtm.sendMessage(data.result.fulfillment.speech, message.channel);
        } else {
          console.log("post message");
          web.chat.postMessage(`Creating reminder for ${data.result.parameters.description} on ${data.result.parameters.date}`,
            message.channel);
        }
      })
      .catch(err => console.log("THERE IS AN ERROR",err));
  }
});

rtm.start();

export default msg;
