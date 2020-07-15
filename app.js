'use strict';

var async 		= require('async');
var bodyParser 	= require('body-parser');
var cors 		= require('cors');
var exec 		= require('child_process').exec;
var express 	= require('express');
var request 	= require('request');
var spawn 		= require('child_process').spawn;

var config = {
	port:			8081,
};

var app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/top/post', function(req, res) {
	var post = [];
	async.waterfall([
	    function(callback) {
			request.get({
				url: `https://jsonplaceholder.typicode.com/posts`,
				json: true,},
				(err, res, body) => {
					callback(err, body);
			})
		},
		function(posts, callback) {
			request.get({
				url: `https://jsonplaceholder.typicode.com/comments`,
				json: true,},
				(_err, _res, _body) => {
					if (_err) callback(_err);

					for (var i=0; i<posts.length; i++) {
						var postsByNumberOfComments = [];
					
						_body.forEach((comment) => {
							if (comment.postId == posts[i].id) {
								postsByNumberOfComments.push(post);
							}
						})
						post[i] = {
							post_id: posts[i].id,
							post_title: posts[i].title,
							post_body: posts[i].body,
							total_number_of_comments: postsByNumberOfComments.length,
						}
					}
					post.sort((a, b) => (a.total_number_of_comments < b.total_number_of_comments) ? 1 : -1);
					callback(null, post);
			});
		}
	], function (err, result) {
		if (err) return res.sendStatus(500);
		return res.status(200).send(post);
	});
});

app.get('/comments/by', function(req, res) {
	var filteredComments = [];
	var searchComment = req.query.filter;
	request.get({
		url: `https://jsonplaceholder.typicode.com/comments`,
		json: true,},
	(err, _res, body) => {
		var comments = body;
		for (let comment of comments) {
			if(comment.name.toLowerCase().search(searchComment.toLowerCase())  !== -1 ||
			   comment.email.toLowerCase().search(searchComment.toLowerCase()) !== -1 ||
			   comment.body.toLowerCase().search(searchComment.toLowerCase())  !== -1) {
				filteredComments.push(comment);
			}
		}
		return res.status(200).send(filteredComments);
	});
});

app.listen(config.port, function() {
	console.log('ready!');
});
