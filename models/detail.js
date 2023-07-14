var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const detailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  aadhar: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

// Create the model
const Detail = mongoose.model('detail', detailSchema, 'detail');

module.exports = Detail;
