import { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client';
import axios from 'axios';

const botToken = process.env.BOT_TOKEN;

const rtm = new RtmClient(botToken);
const web = new WebClient(botToken);

const channels = {};

// The client will emit an RTM.AUTHENTICATED event on successful connection,
//    with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  rtmStartData.channels.forEach((c) => {
    channels[c.name] = c;
  });
});

// you need to wait for the client to fully connect before you can send messages

const { User } = require('./models');

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  rtm.sendMessage(`I am a working bot! ${new Date()}`, channels.general.id);
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  if (message.user) {
    web.reactions.add('brian', {
      channel: message.channel,
      timestamp: message.ts,
    });
    rtm.sendMessage(`Hello <@${message.user}>!`, message.channel);
    User.findOne({ slackId: message.user })
      .then((user) => {
        if (!user) {
          return new User({
            slackId: message.user,
            slackDmId: message.channel,
          }).save();
        }
        return user;
      })
      .then((user) => {
        if (!user.google) {
          rtm.sendMessage(`Hello!
      This is Scheduler Bot. In order to schedule reminders for you, I need access to your Google Calendar.
      Please visit: http://localhost:3000/connect?user=${user._id} to setup Google Calendar`, message.channel);
        }
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
            console.log('what is data', data) //data.result.actionIncomplete 
            if (data.result.actionIncomplete || (data.result.metadata.intentName !== 'reminder.add' && data.result.metadata.intentName !== 'meeting.add')) {
              console.log('action incomplete');
              rtm.sendMessage(data.result.fulfillment.speech, message.channel);
            } else if (data.result.metadata.intentName === 'reminder.add') {
              console.log('Action complete', data.result.parameters);
              user.pending.task = data.result.parameters.task; // eslint-disable-line
              user.pending.date = data.result.parameters.date; // eslint-disable-line
              user.save();

              web.chat.postMessage(message.channel, `Creating reminder for
        ${user.pending.task} on ${user.pending.date}`,
                {
                  attachments: [
                    {
                      fallback: 'not able',
                      callback_id: 'simple',
                      color: '#3AA3E3',
                      id: 1,
                      actions: [
                        {
                          id: '1',
                          name: 'confirmation',
                          text: 'Yes',
                          type: 'button',
                          value: 'true',
                        },
                        {
                          id: '2',
                          name: 'confirmation',
                          text: 'No',
                          type: 'button',
                          value: 'false',
                        },
                      ],
                    },
                  ],
                });
                
            } else if (data.result.metadata.intentName === 'meeting.add') {
              console.log('meeting added');
            }
          })
          .catch(err => console.log('THERE IS AN ERROR', err));
      });
  }
});

rtm.start();
