const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sale: {
    type: Number,
    required: true
  },
  img: String,
  description: String,
  category: String,
  gpu: String,
  cpu: String,
  rum: String,
  ssd: String,
  comments: [
    {
      user: {
        type: String,
        required: true
      },
      text: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model('Product', productSchema);
