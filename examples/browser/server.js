const path=require('path')
var http = require('http');
var express = require('express');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, '../../dist')));

var server = http.createServer(app);
server.listen(9000);