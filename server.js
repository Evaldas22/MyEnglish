var express = require('express');
var studentsRouter = require('./routes/api/students').router;
var groupsRouter = require('./routes/api/groups');
var wordsRouter = require('./routes/api/words');
var mongoose = require('mongoose');
const url = require('url');
const axios = require('axios');
var bodyParser = require('body-parser');

let sapaiToken = "";
// sapaiToken = require('./config/sapAiToken').sapaiToken;
const SAPCAI_REQUEST_TOKEN = process.env.sapaiToken || sapaiToken;

var localConnectionString = "";
// localConnectionString = require('./config/connectionString').mongoURI;
var connectionString = process.env.connectionString || localConnectionString;

// Set up the express app
const app = express();

// connect to MongoDB
if (connectionString) {
  mongoose.connect(connectionString, { useNewUrlParser: true })
    .then(() => { console.log('Connected to database succesfully'); })
    .catch(err => { console.log(err); });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', studentsRouter);
app.use('/api', groupsRouter);
app.use('/api', wordsRouter);

// this will act as proxy, which will send request to SAP Conversational AI
// and send back chatfuel formatted message back.
app.get('/', (req, res) => {
  const query = url.parse(req.url, true).query;
  const userId = query['chatfuel user id'];
  const userMessage = query['user_message'];

  // Call SAP Conversational AI API with the user message
  return axios
    .post('https://api.cai.tools.sap/build/v1/dialog',
      {
        message: { content: userMessage, type: 'text' },
        conversation_id: userId,
      },
      { headers: { Authorization: `Token ${SAPCAI_REQUEST_TOKEN}` } }
    )
    .then(body => {
      // Format messages to Chatfuel format
      const formattedMessages = body.data.results.messages.map(chatfuelFormat);

      // Sends the answer back to Chatfuel 
      res.json({
        messages: formattedMessages,
      });
    });
});

const server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.listen(server_port, server_ip_address, function () {
  console.log(`Listening on ${server_ip_address}:${server_port}`)
});

function chatfuelFormat(message) {
  // Source : { type: 'text', content: 'XXX' }
  // Destination { text: 'XXX' }
  if (message.type === 'text') {
    return { text: message.content };
  }

  // // Source: { type: 'picture', content: 'URL' }
  // // Destination: { attachment: { type: 'image', payload: { url: 'URL' } } }
  // if (message.type === 'picture') {
  //   return {
  //     attachment: {
  //       type: 'image',
  //       payload: { url: message.content },
  //     },
  //   };
  // }

  console.error('Unsupported message format: ', message.type);
  return { text: 'An error occured' };
}