var path = require('path');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3030;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');

/** Description of prop "foo". */
// using webpack-dev-server and middleware in development environment
if (process.env.NODE_ENV !== 'production') {
  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');
  var webpack = require('webpack');
  var config = require('./webpack.config');
  var compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));
  app.use(webpackHotMiddleware(compiler));
}


var os = require('os');
var ifaces = os.networkInterfaces();
var server_ip;

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }
    server_ip = iface.address;
    ++alias;
  });
});


//require('./server_modules/google_init.js');

app.use(express.static(path.join(__dirname, 'app')));

app.get('*', function(request, response) {
  response.sendFile(__dirname + '/app/index.html')
});

app.get('/style/', function(request, response) {
  response.sendFile(__dirname + '/styleguide/index.html')
});




server.listen(PORT, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.', PORT, PORT);
    console.info('==> 🌎 ', server.address());
}
});



io.on('connection', function(client) {
  console.info('client connected!','clientsCount '+client.server.eio.clientsCount);

  client.on('disconnect', function(){
    console.info('client disconnected');
  });
  client.on('wire', function(data) {
    console.log('\x1b[36m%s\x1b[0m','client:',data);
  });
  client.on('message', function(data) {
    console.log('\x1b[36m%s\x1b[0m','client', data);
  });

  client.on('log', function(data) {
    console.log('\x1b[42m%s\x1b[0m','command', data);
    console.log(client.server[data])
  });
  client.on('exec', function(data) {
    console.log('\x1b[42m%s\x1b[0m','command', data);
  });

  client.emit('news',   {topic: 'update available\n'});
  client.emit('message', {title: 'hello world'});
  client.emit('wire', {server_connected: server.address()});
  client.emit('wire', {device_connected: 'server_'+server_ip});

});



var other_server = require("socket.io-client")('http://motionwire.herokuapp.com/'); // This is a client connecting to the SERVER 2
other_server.on("connect",function(){
    console.log('\x1b[35m%s\x1b[0m','remote server -heroku- connected');
    other_server.on('wire',function(data){
      console.log('\x1b[35m%s\x1b[0m','wire',data);
        // We received a message from Server 2
        // We are going to forward/broadcast that message to the "Lobby" room
        //io.to('lobby').emit('message',data);
    });

    other_server.on('message', function(data) {
      console.log('\x1b[35m%s\x1b[0m','server', data);
    });
});
