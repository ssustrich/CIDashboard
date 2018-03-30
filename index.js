var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var request = require('request'),

username = "{USERNAME}",
password = "{PASSWORD}",
//get all in issues ive ever workjed on   fileds navigatable means its just a summary
url = "http://{JIRAS_SERVER}/rest/api/2/search?jql=assignee={USERNAME}&In%20Progress&fields=navigable",

auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

app.use(bodyParser.json())

app.get('/api/jira', function(req, res){
	request({url : url, headers : {"Authorization" : auth},
	//LEARN:I dont understand scope, what if I want to see whats in headers?
	//		or should I just not worry about that and let the framework hanbdle it
	//		All i know is that I cant print out the contents of headers to the console below
	//console.log(url + "-" + headers + "-" + auth)
	}, function(err, body){
		//For data display I want an array of issues returned from JIRA not all the other stuff
		//I don't care what the result code was etc for this simple graph
		//This works, in the console I see just a list of issues that I have ever worked on!
		var issuesArray = (JSON.parse(body.body)).issues;
		var keyArray =[];
		issuesArray.forEach(function(value){
			console.log(value.key);
			keyArray.push(value.key);
		});
		
		//DO STUFF WITH this data.
		//Queery on each issue to see what status it is in? Then make a pie graph or something cool. or a chart to show how much time I have spoend versus how much time remaining
		
		//so thats good, on the display i see just a list of jira issue keys. Great success
		res.json(keyArray);
	});
});

// parse application/json
app.use(bodyParser.json())

app.listen(3000);
