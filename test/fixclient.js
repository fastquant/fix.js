#!/usr/bin/env node

// Modules we need
var crypto = require('crypto');
var fix = require('fixjs');
var net = require('net');
var tls = require('tls');
var program = require('commander');
var url = require('url');
var uuid = require('uuid');
 
var Msgs = fix.Msgs;
 
var apiKey = 'API_KEY';
var secret = 'API_SECRET';
var passphrase = 'PASSPHRASE';

// Use TLS
net = tls;
 
// Connect the stream!
var stream = net.connect({
    host: 'fix.exchange.coinbase.com',
    port: '4198'
}, function() {
    console.log('connected to server');
});
 
// Log errors
stream.on('error', function(err) {
    console.error(err);
});
 
// Create the object to hold the stream
var client = fix.createClient(stream);

// Start a session and send a small cancellable order
var session = client.session(apiKey, 'Coinbase');
session.on('logon', function() {
    console.log('logged on, sending new order');
 
    var order = new Msgs.NewOrderSingle();
    order.Symbol = 'BTC-GBP';
    order.ClOrdID = uuid();
    order.Side = 1;
    order.HandlInst = 1;
    order.TransactTime = new Date();
    order.OrdType = 2; // 2=Limit
    order.OrderQty = 0.01;
    order.Price = 70;
    order.TimeInForce = 1; // 1=GTC
    order.set(7928, 'D'); // STP
    session.send(order);
});
 
// Test request
session.on('TestRequest', function(msg, next) {
    console.log('%s', msg);
    next();
});
 
// The rest of these are handlers for various FIX keywords
session.on('ExecutionReport', function(msg, next) {
    console.log('incoming message: %s', msg);
    next();
 
    if (msg.ExecType === 0) { // ack
        var cancel = new Msgs.OrderCancelRequest();
        cancel.Symbol = msg.Symbol;
        cancel.OrigClOrdID = msg.ClOrdID;
        cancel.ClOrdID = 1235;
        cancel.OrderID = msg.OrderID;
        session.send(cancel);
    } else if (msg.ExecType == 1 || msg.ExecType == 2) { // fill
        // nothing to do
    } else if (msg.ExecType == 3 || msg.ExecType == 4) { // done/canceled
        session.logout();
    } else if (msg.ExecType == 'D') { // unsolicited reduce
        console.log('got unsolicited reduce, new OrderQty:', msg.OrderQty);
    } else {
        console.log('unexpected message:', msg);
    }
});

session.on('OrderCancelReject', function(msg, next) {
    console.log('order cancel reject: %s', msg);
    next();
});
 
session.on('Reject', function(msg, next) {
    console.log('reject: %s', msg);
    stream.end();
    next();
});
 
session.on('send', function(msg) {
    //msg.replace(/\s/g,/\r\n/);
    console.log(msg);
    console.log('sending message: %s', msg);
});
 
session.on('error', function(err) {
    console.error(err.stack);
});
 
session.on('logout', function() {
    console.log('logged out');
});
 
session.on('end', function() {
    console.log('session ended');
    stream.end();
});
 
stream.on('end', function() {
    console.log('stream ended');
});
 
// create our own Logon message so we can control the SendingTime and sign it
var logon = new Msgs.Logon();
logon.SendingTime = new Date();
console.log(logon.SendingTime);
logon.HeartBtInt = 30;
logon.EncryptMethod = 0;
logon.set(554, passphrase); // FIX 4.4 Password tag
 
var presign = [
    logon.SendingTime,
    logon.MsgType,
    session.outgoing_seq_num,
    session.sender_comp_id,
    session.target_comp_id,
    passphrase
];
 
var what = presign.join('\x01');
logon.RawData = sign(what, secret);
console.log("logon.RawData: " + logon.RawData);
session.send(logon, true);
 
function sign(what, secret) {
    var key = Buffer(secret, 'base64');
    var hmac = crypto.createHmac('sha256', key);
    console.log("presign: " + what);
    var signature = hmac.update(what).digest('base64');
    return signature;
}