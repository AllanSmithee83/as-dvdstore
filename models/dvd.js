var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;

var DvdSchema = new Schema({
   name: String,
  ganre: String,
  director: String,
  year: String,
  price: Number,
  image: String,
});

DvdSchema.plugin(mongoosastic, {
  hosts: [
    'localhost:9200'
  ]
});

module.exports = mongoose.model('Dvd', DvdSchema);