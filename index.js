var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jiraUsername = "plugh";
var jiraPassword = "qwerty";
var jiraServer = "foobar.com"
var request = require('request');

app.use(bodyParser.json())

//current entry point to the dashboard, simply gets some data from jira, parses it and sends
//assigned issue keys back to the user.
app.get('/api/jira', function (req, res, next) {
	//get all in issues ive ever workjed on fileds navigatable means its just a summary
	url = jiraServer + "assignee=ssustrich&In%20Progress&fields=navigable";
	auth = "Basic " + new Buffer(jiraUsername + ":" + jiraPassword).toString("base64");

	request({
		url: url,
		headers: {
			"Authorization": auth
		},
		//LEARN:I dont understand scope, what if I want to see whats in headers?
		//		or should I just not worry about that and let the framework hanbdle it
		//		All i know is that I cant print out the contents of headers to the console below
		//console.log(url + "-" + headers + "-" + auth)
	}, function (err, body) {
		//For data display I want an array of issues returned from JIRA not all the other stuff
		//I don't care what the result code was etc for this simple graph
		//This works, in the console I see just a list of issues that I have ever worked on!
		var issuesArray = (JSON.parse(body.body)).issues;
		var keyArray = [];
		issuesArray.forEach(function (value) {
			keyArray.push(value.key);
		});

		//LEARN: I saw that you can assign to RES and REQ locals
		//But I dont know what my keyArray is like. What I would like to do
		//is pass it as a plain old parameter to a function. I'm not event
		//sure I should be doing next. I think Yes because this call leads to
		//a repsonse to the Get call to return a chart...
		next.keyArray = keyArray
			next();
		//STEP 2:??????

		//STep 3, return a chart to the user. I assume this will make use of template middleware
		res.json(keyArray);
	});
}, function (req, res, next) {
	//Still have a bad feeling I dont understand scope very well and I'm not thinking in a nodejs mindset
	var jiraIssues = new Map();

	next.keyArray.forEach(function (value) {
		url = jiraServer + "issue=" + value + "&fields=timeoriginalestimate,timeestimate",
		auth = "Basic " + new Buffer(jiraUsername + ":" + jiraPassword).toString("base64");
		request({
			url: url,
			headers: {
				"Authorization": auth
			},
		}, function (err, body) {
			var data = JSON.parse(body.body);
			var issueData = {
				"timeEstimate": data.issues[0].fields.timeoriginalestimate,
				"timeRemaing": data.issues[0].fields.timeestimate,
			}
			jiraIssues.set(value, issueData);
			console.log(jiraIssues);

			app.locals.resultSet = jiraIssues;
		});
	});
	//LEARN: So here is an issue I have with asyncronous stuff
	//This section of code gets executed before the request stuff comes back
	//I'm sure there are a thousand ways to do it wrong
	//I need to learn how to handle this the righht way
	console.log(app.locals.resultSet);
});

app.listen(3000, () => console.log('Dashboard listening on port 3000'));
