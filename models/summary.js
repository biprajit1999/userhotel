const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
 name: {
    type: String,
    required: true
  },
 phone: {
    type: String,
    required: true
  },
  ratingHotel: {
    type: Number,
    required: true
  },
  ratingReception: {
    type: Number,
    required: true
  },
  ratingCleanliness: {
    type: Number,
    required: true
  },
  ratingAmenities: {
    type: Number,
    required: true
  },
  ratingLocation: {
    type: Number,
    required: true
  },
  ratingFood: {
    type: Number,
    required: true
  },
  ratingStaff: {
    type: Number,
    required: true
  },
  ratingValue: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true
  }
});

// Create the model
const Feedback = mongoose.model('feedback', feedbackSchema);

module.exports = Feedback;
