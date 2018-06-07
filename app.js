var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var express = require('express');
var app = express();
var http = require('http'); 
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(bodyParser.json({limit: "100mb"}));
app.use(bodyParser.urlencoded({limit: "100mb", extended: true, parameterLimit:100000}));
app.use(cors());

/**
 * Adds an application to the database.
 */
app.post('/application', function (req, res) {
  MongoClient.connect(getConnection(), function(err, client) {
    assert.equal(null, err); //Checks if something went wrong.

    var db = client.db('gdap_db');

    if(client.isConnected()) {
      //Check if application name already exists, so yes update else insert new application.
      db.collection("Applications").updateOne({"appName": req.body.appName}, {$set: req.body}, { upsert: true }, function (error, response) {
        if(error) {
          console.log('Error occurred while inserting');
          res.status(406);
          res.send("Couldn't add application");
        } else {
          if(response.nModified == 0) {
            res.status(201);
            res.send(response.upserted);
          } else {
            res.status(200);
            res.send(req.body);
          }
        }
      });
    } else {
      res.status(406);
      res.send("Couldn't connect to database");
    }
 
    client.close();
  });
})

/**
 * Gets an application by his name
 */
app.get("/application/:name", function(req, res) {
  MongoClient.connect(getConnection(), function(err, client) {
    assert.equal(null, err);

    var db = client.db('gdap_db');
    
    if(client.isConnected()) {
      db.collection("Applications").findOne({"appName": decodeURI(req.params.name)}, function(err1, result) {
        if(err1) {
          console.log(err1);
          res.status(406);
          res.send("Couldn't retrieve application");
        } else {
          res.status(200);
          res.send(result);
        }
      });
    } else {
      res.status(406);
      res.send("Couldn't connect to database");
    }

    client.close();
  });
})

/**
 * Gets all application names
 */
app.get("/application", function(req, res) {
  MongoClient.connect(getConnection(), function(err, client) {
    if(err) {
			console.log(err);
		}

    var db = client.db('gdap_db');
    //var names = [];
    
    if(client.isConnected()) {
      db.collection("Applications").find().project({appName: 1, _id:0}).toArray(function(err1, result) {
        if(err1) {
          console.log(err1);
          res.status(406);
          res.send("Couldn't retrieve application");
        } else {
          res.status(200);
          res.send(result);
        }
      });
    } else {
      res.status(406);
      res.send("Couldn't connect to database");
    }

    client.close();
  });
})

/**
 * Gets whole collection
 */
app.get("/", function(req, res) {
  MongoClient.connect(getConnection(), function(err, client) {
    assert.equal(null, err);

    var db = client.db('gdap_db');
    
    if(client.isConnected()) {
      db.collection("Applications").find().toArray(function(err1, result) {
        if(err1) {
          console.log('Error occurred while retrieving application');
          res.status(406);
          res.send("Couldn't retrieve application");
        } else {
          res.status(200);
          res.send(result);
        }
      });
    } else {
      res.status(406);
      res.send("Couldn't connect to database");
    }

    client.close();
  });
})

var server = app.listen(8080, function(){
	var address = server.address();
	console.log('Server listening on port ' + address.port);
});

function getConnection(){
  //return 'mongodb://localhost:27017';
//	return 'mongodb://uriiogosljlvh2d:tIqgSDAEP9qbWr2Wk9Nq@begdmvi5aoj7y7l-mongodb.services.clever-cloud.com:27017/begdmvi5aoj7y7l';
	return 'mongodb://gdap_admin:admin123@ds147190.mlab.com:47190/gdap_db';
}