var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const url = require('url');
const axios = require('axios');
const path = require('path');
const logger = require('./server/logging/logger');
const passport = require('passport');

var studentsRouter = require('./server/routes/api/students').router;
var groupsRouter = require('./server/routes/api/groups');
var wordsRouter = require('./server/routes/api/words').router;
var teachersRouter = require('./server/routes/api/teachers');

let sapaiToken = "";
// sapaiToken = require('./config/sapAiToken').sapaiToken;
const SAPCAI_REQUEST_TOKEN = process.env.sapaiToken || sapaiToken;

var localConnectionString = "";
// localConnectionString = require('./server/config/connectionString').mongoURI;
var connectionString = process.env.connectionString || localConnectionString;

// Set up the express app
const app = express();

// connect to MongoDB
if (connectionString) {
  mongoose.connect(connectionString, { useNewUrlParser: true })
    .then(() => { logger.info('Connected to database succesfully'); })
    .catch(err => { logger.info(err); });
}

// Use Passport middleware
app.use(passport.initialize());

// Passport config
require('./server/validation/passport')(passport);

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', studentsRouter);
app.use('/api', teachersRouter);
app.use('/api', groupsRouter);
app.use('/api', wordsRouter);

// this will act as proxy, which will send request to SAP Conversational AI
// and send back chatfuel formatted message back.
app.get('/smallTalk', (req, res) => {
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

// serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static('client/build'));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.listen(server_port, server_ip_address, function () {
  logger.info(`Listening on ${server_ip_address}:${server_port}`);
});

function chatfuelFormat(message) {
  if (message.type === 'text') {
    return { text: message.content };
  }

  logger.error('Unsupported message format: ', message.type);
  return { text: 'An error occured' };
}