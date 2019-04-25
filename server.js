var express = require('express');
var studentsRouter = require('./routes/api/students').router;
var groupsRouter = require('./routes/api/groups');
var wordsRouter = require('./routes/api/words');
var mongoose = require('mongoose');

var localConnectionString = "";
localConnectionString = require('./config/connectionString').mongoURI;
var connectionString = process.env.connectionString || localConnectionString;

// Set up the express app
const app = express();

// connect to MongoDB
if (connectionString) {
  mongoose.connect(connectionString, { useNewUrlParser: true })
    .then(() => { console.log('Connected to database succesfully'); })
    .catch(err => { console.log(err); });
}

app.use('/api', studentsRouter);
app.use('/api', groupsRouter);
app.use('/api', wordsRouter);

const server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.listen(server_port, server_ip_address, function () {
  console.log(`Listening on ${server_ip_address}:${server_port}`)
});