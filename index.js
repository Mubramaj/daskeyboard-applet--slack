const q = require('daskeyboard-applet');

const logger = q.logger;
const queryUrlBase = 'https://slack.com/api/';

function getTimestamp() {
  var d = new Date(Date.now()),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

class Slack extends q.DesktopApp {
  constructor() {
    super();
    this.timestamp = getTimestamp();
    // For checking plural or singular
    this.notification = "";
  }

  async getMessages() {
    const query = "search.messages?query=pickleface&sort=timestamp&pretty=1";
    const proxyRequest = new q.Oauth2ProxyRequest({
      apiKey: this.authorization.apiKey,
      uri: queryUrlBase + query
    });

    // first get the user projects
    return this.oauth2ProxyRequest(proxyRequest);
  }

  async run() {
    console.log("Running.");
    return this.getMessages().then(newMessages => {
      this.timestamp = getTimestamp();
      logger.info("This is the response",newMessages);
      if (newMessages && newMessages.length > 0) {

        if (newMessages.length == 1) {
          this.notification = "notification";
        } else {
          this.notification = "notifications";
        }

        logger.info("Got " + newMessages.length + this.notification);


        return new q.Signal({
          points: [
            [new q.Point("#0000FF", q.Effects.BLINK)]
          ],
          name: `Slack`,
          message: `You have a new notification.`,
          link: {
            url: 'https://slack.com',
            label: 'Show in Slack',
          },
        });
      } else {
        return null;
      }
    }).catch(error => {
      const message = error.statusCode == 402
        ? 'Payment required. This applet requires a premium Slack account.' : error;
      logger.error(`Sending error signal: ${message}`);
      throw new Error(message);
    })
  }
}


module.exports = {
  Slack: Slack
}

const applet = new Slack();