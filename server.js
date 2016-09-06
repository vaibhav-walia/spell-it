var express = require('express')
var app = express(); //express();
var https = require('https');

var mongodb = require('mongodb');
var mongoose = require('mongoose');


var User = require('./models/user.js');
var List = require('./models/list.js');



var args = process.argv.slice(2);
//var uri = "mongodb://" + args[0] + ":" + args[1] + "ds019756.mlab.com:19756/spell-it";
var uri = "mongodb://vaibhav:welcome1@ds019756.mlab.com:19756/spell-it";
//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-access-token');

  next();
};

app.use(allowCrossDomain);
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//connect to db
mongoose.connect(uri);

//ROUTES
//==============================================================================
var router = express.Router();
router.get('/', function(req, res) {
  res.json({
    message: 'login prompt'
  });
});

router.route('/register')
  .post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password) {
      res.json({
        message: 'username or password missing!'
      });
    }
    else {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save(function(err) {
        if (err)
          res.send(err);
        res.json({
          message: 'User ' + username + ' created'
        });
      });
    }
  });

router.route('/userLists/:user')
  .get(function(req, res) {
    //return all the lists for a user
    User.findOne({
      username: req.params.user
    }, function(err, user) {
      if (err) {
        res.send(err);
        throw err;
      }
      if (!user) {
        //user not found
        res.json({
          success: false,
          message: 'User not found'
        });
      }
      else {
        //user was found, get all lists
        List.find({
          username: req.params.user
        }, function(err, lists) {
          if (err) {
            res.send(err);
            throw err;
          }
          else {
            res.json({
              success: true,
              message: '',
              data: lists
            });
          }
        });
      }
    });
  })
  .post(function(req, res) {
    //add a list to the users list 
    User.findOne({
        username: req.body.username
      },
      function(err, user) {
        if (err) {
          res.send(err);
          throw err;
        }
        else {
          //user exists, check if list is empty 
          var list = req.body.list;
          if (!list || !list.words || list.words.length === 0) {
            res.json({
              success: false,
              message: 'List is empty'
            });
          }
          else {
            //valid list, add
            var newList = new List(list);
            newList.save(function(err) {
              if (err)
                res.send(err);
              res.json({
                message: 'List ' + list.name + ' created'
              });
            });
          }
        }
      })
  });

app.use('/api', router);
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var ip = process.env.IP || "0.0.0.0";
  var port = process.env.PORT || 3000;
  console.log("Started on " + ip + ":" + port);
});