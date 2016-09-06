var mongoose = require('mongoose');
var schema = mongoose.Schema;

//schema for users
var listSchema = new schema({
    name: String,
    username: String,
    words : [String]
});

//make a model out of the schema
var List = mongoose.model('List',listSchema);
module.exports = List;