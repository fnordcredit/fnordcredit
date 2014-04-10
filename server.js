var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use('/', express.static(__dirname + '/static'));
app.use(bodyParser());

app.get("/users/all", function(req, res){
	res.send(JSON.stringify(getAllUsers()));
});

app.post("/user/credit", function(req, res){
	var user = getUser(req.body.username);
	if(user == undefined){
		res.send(404, "User not found.");
		return;
	}
	user.credit += +req.body.delta;
	saveUser(user);
	res.send(JSON.stringify(user));
});


var users = {
	xandy: {"name":"xandy", "credit":5},
	silsha: {"name":"silsha", "credit":5}
}
function getUser(username){
	return users[username];
}

function saveUser(user){
	users[user.name] = user;
}

function getAllUsers(){
	var names = Object.keys(users);
	return names.map(function(name){
		return users[name];
	});
}

var server = app.listen(8000, function(){
	console.log("Server running ...");
})