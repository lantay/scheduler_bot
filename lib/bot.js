import { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client';
import axios from 'axios';

const botToken = process.env.BOT_TOKEN;

const rtm = new RtmClient(botToken);
const web = new WebClient(botToken);

const channels = {};
const { User, Reminder } = require('./models');

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
  // const dm = rtm.dataStore.getDMByUserId(message.user);
  // if (!dm || dm.id !== message.channel || message.type !== 'message') {
  //   console.log('MESSAGE NOT SENT TO DM, IGNORING');
  //   return;
  // }
  // console.log('what is messsage', message)
  // if (message.text.indexOf('Remind') !== -1) {
  web.reactions.add('brian', {
    channel: message.channel,
    timestamp: message.ts,
  });
  if (message.user) {
    console.log('Message User:', message.user);
    rtm.sendMessage(`Hello <@${message.user}>!`, message.channel);
    User.findOne({ slackId: message.user })
    .then((user) => {
      console.log('BEFORE');
      if (!user) {
        return new User({
          slackId: message.user,
          slackDmId: message.channel,
        }).save();
      }
      console.log('AFTER');
      return user;
    })
    .then((user) => {
      if (!user.google) {
        rtm.sendMessage(`In order to schedule reminders for you, I need access to your Google Calendar.
        Please visit: http://localhost:3000/connect?user=${user._id} to setup Google Calendar`, message.channel)
      }
    });
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
        if (data.result.actionIncomplete || data.result.metadata.intentName !== 'reminder.add') {
          console.log('action incomplete');
          rtm.sendMessage(data.result.fulfillment.speech, message.channel);
        } else {
          // console.log('post message', data.result.parameters);
          // rtm.sendMessage(`Creating reminder for ${data.result.parameters.task}
          // on ${data.result.parameters.date}`, message.channel)
          // web.chat.postMessage(,message.channel,`Creating reminder for
          // ${data.result.parameters.description} on ${data.result.parameters.date}`);
          console.log('THE REQUEST IS COMPLETE');
          Reminder.find({ date: data.result.parameters.date })
          .then((reminder) => {
            console.log('THIS IS REMINDER', reminder);
            return new Reminder({
              subject: data.result.parameters.task,
              date: data.result.parameters.date,
              userId: message.user,
            }).save();
          });
          web.chat.postMessage(message.channel, `Creating reminder for
            ${data.result.parameters.task} on ${data.result.parameters.date}`,
            {
              attachments: [
                {
                  fallback: 'not able',
                  callback_id: 'simple',
                  color: '#3AA3E3',
                  id: 1,
                  // 'attachment_type': 'default',
                  actions: [
                    {
                      id: '1',
                      name: 'confirmation',
                      text: 'Yes',
                      type: 'button',
                    },
                    {
                      id: '2',
                      name: 'confirmation',
                      text: 'No',
                      type: 'button',
                    },
                  ],
                },
              ],
            }
          );
        }
      })
      .catch(err => console.log('THERE IS AN ERROR', err));
  }
});

rtm.start();
