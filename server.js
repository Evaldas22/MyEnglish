var express = require('express');
var studentsRouter = require('./routes/api/students');
var mongoose = require('mongoose');

// var connectionString = require('./config/connectionString').mongoURI;
var connectionString = "";

// Set up the express app
const app = express();

// connect to MongoDB
if (connectionString.length > 0) {
  mongoose.connect(connectionString, { useNewUrlParser: true })
    .then(() => { console.log('Connected to database succesfully'); })
    .catch( err => { console.log(err); });
}

app.use('/api/students', studentsRouter);

app.get('/process', function (req, res) {
  res.json(process.env);
});

console.log(process.env);

const server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.listen(server_port,server_ip_address, function() {
  console.log(`Listening on ${server_ip_address}:${server_port}`)
});