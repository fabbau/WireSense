var path = require('path');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3030;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
const { exec } = require('child_process');
var device = require('express-device');
var heroku_server = require("socket.io-client")('http://motionwire.herokuapp.com/'); // This is a client connecting to the SERVER 2

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

app.use(device.capture());

app.get('*', function(request, response) {
  console.log('device',request.device.type.toUpperCase());
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
}
});


  io.on('connection', function(client) {
    var clients = client.server.eio.clientsCount;
    console.info('client connected!','clientsCount '+ clients );

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
      console.log([data]);
    });


    client.on('exec', function(cmd) {
      console.log('\x1b[42m%s\x1b[0m','command', cmd);
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log('\x1b[42m%s\x1b[0m',`stdout: ${stdout}`);
        console.log('\x1b[42m%s\x1b[0m',`stderr: ${stderr}`);
      });
    });

    client.emit('news',   {topic: 'update available\n'});
    client.emit('message', {title: 'hello world'});
    client.emit('wire', {server_connected: 'server_'+server_ip});
    //client.emit('wire', {device_connected: 'device_'});


                heroku_server.on("connect",function(){
                  console.log('\x1b[35m%s\x1b[0m','remote server -heroku- connected');

                  heroku_server.on('wire',function(data){
                    console.log('\x1b[35m%s\x1b[0m','wire',data);
                    client.emit('wire', data);
                  });

                });

  });
