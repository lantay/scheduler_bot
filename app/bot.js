import { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client';
import axios from 'axios';
import moment from 'moment';

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

const { User, Reminder } = require('./models');

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  rtm.sendMessage(`I am a working bot! ${new Date()}`, channels.general.id);
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  if (message.text === 'check') {
    console.log('checking');
    Reminder.find({
      date: {
        $gte: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).unix() * 1000,
        $lte: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(2, 'day').unix() * 1000,
      },
    })
      .then((reminders) => {
        console.log('gets into reminder', reminders);
        reminders.forEach((reminder) => {
          User.find({ slackId: reminder.userSlackId })
            .then((user) => {
              console.log('enters .then', user);
              rtm.sendMessage(`Reminder! Don't forget to ${reminder.task} ${moment(reminder.date).format('MM/DD/YYYY')}!`, message.channel);
            });
        });
      });
  }

  if (message.user) {
    web.reactions.add('brian', {
      channel: message.channel,
      timestamp: message.ts,
    });
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
        } else {
          message.text = message.text.replace('@', '');
          console.log('message.text', message.text);
          const regex = /<@\w+>/g;
          const users = [];
          message.text = message.text.replace(regex, (match) => { // eslint-disable-line
            // const userId = match.slice(2, -1);
            // const use = rtm.dataStore.getUserById(userId);
            users.push({
              displayName: user.profile.real_name,
              email: user.profile.email,
            });
            return user.profile.first_name || user.profile.real_name;
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
                        callback_id: 'reminder',
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
                console.log('meeting added', data.result.parameters);
                user.pending.title = data.result.parameters.any; // eslint-disable-line
                user.pending.date = data.result.parameters.date; // eslint-disable-line
                user.pending.time = data.result.parameters.time; // eslint-disable-line
                // const a = data.result.parameters['given-name2'];
                // console.log(a);
                // const b = a.slice(1);
                // console.log("a is", a, "b is", b);
                user.pending.invitees = data.result.parameters['given-name2']; // eslint-disable-line
                user.save();
                web.chat.postMessage(message.channel, `Creating meeting about
                ${user.pending.title} on ${user.pending.date} at ${user.pending.time} with ${user.pending.invitees}`,
                  {
                    attachments: [
                      {
                        fallback: 'not able',
                        callback_id: 'meeting',
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
              }
            })
            .catch(err => console.log('THERE IS AN ERROR', err));
        }
      });
  }
});

rtm.start();
