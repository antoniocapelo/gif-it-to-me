#!/usr/bin/env node

// requiring modules
var argv = require('yargs').argv;
var cp = require('copy-paste');
var _ = require('lodash');
var request = require('request');
var fs = require('fs');
var child_process = require('child_process');
var http = require('http');

// Giphy API stuff
var baseUrl = 'http://api.giphy.com/v1/gifs/';
var baseUrlRandom = 'http://api.giphy.com/v1/gifs/random';
var apiKey = 'dc6zaTOxFJmzC';

// Aux vars
var isInSearch;
var server;
var browserProcess;
var searchLimit = 10;
var offset = 0;

(function init(argument) {
  detectStuff();
  launchServer();

  browserProcess = child_process.spawn('open', ['http://127.0.0.1:8000?q=' + encodeURIComponent(queryTerm)], function(err) {
    if (err) { //process error
      console.log('An error occurred. So sad.');
    }
  })
}());

function detectStuff() {
  // check what mode is it in:
  // Normal mode -> random gif given search/tag
  // Search Mode -> set of gifs given search/tag
  queryTerm = argv.s;
  isInSearch = queryTerm !== undefined;
  if (!isInSearch) {
    queryTerm = argv.r || _.first(argv._);
  }

  searchLimit = argv.l ? argv.l : searchLimit;

  baseUrl = isInSearch ? baseUrl + 'search' : baseUrl + 'random';
}

function launchServer() {
  server = http.createServer(function(request, response) {
    makeRequest(response);
  });
  server.listen(8000);
  server.on('request', function onreq(req, resp) {
    if (isInSearch) {
      offset += searchLimit;
    }
  })
}

function writeResponse(response, gifArray) {
  response.writeHead(200, {
    "Content-Type": "text/html"
  });
  response.write("<html>");
  response.write("<head>");
  response.write("<title>gifme</title>");
  response.write("</head>");
  response.write("<body>");
  _.map(gifArray, function(gifsrc) {
    response.write("<img src=\"" + gifsrc + "\"/>");
  );
  response.write("<br/>");
  response.write("</body>");
  response.write("</html>");
  response.end();
}


function makeRequest(serverResponse) {
  request({
    url: baseUrl,
    qs: {
      'tag': queryTerm,
      'q': queryTerm,
      'limit': searchLimit,
      'offset': offset,
      api_key: apiKey
    }
  },
  function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body).data;
      var gifSrc;
      var gifArray;
      if (_.isEmpty(data)) {
        return;
      }

      // if in normal mode, just get the image_url property from data
      // if in search mode, get a random gif from the set
      gifSrc = isInSearch ?  undefined : data.image_url; 
      gifArray  = [];
      if (isInSearch) {
        _.map(JSON.parse(body).data, function(eachGif) {
          gifArray.push(eachGif.images.fixed_height.url);
        })
      } else {
        gifArray.push(data.image_url);
      }

      if (gifSrc) {
        cp.copy(gifSrc);
        console.log("New gif -> Now paste it :)");
      }

      writeResponse(serverResponse, gifArray);
    } else {
      console.log('No gif, sorry...');
    }
  });
}

function exitHandler(options, err) {
  if (browserProcess) {
    browserProcess.kill('SIGINT');
  }

  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

// Cleaning up
process.on('exit', exitHandler.bind(null, {
  cleanup: true
}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));