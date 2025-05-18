const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      title: String,
      price: Number,
      sale: Number,
      img: String
    }
  ],
  totalPrice: {
    type: Number,
    default: 0
  }
});

cardSchema.statics.fetchByUser = async function(userId) {
  return this.findOne({ user: userId });
};

cardSchema.statics.add = async function(userId, product) {
  let card = await this.findOne({ user: userId });
  if (!card) {
    card = new this({ user: userId });
  }
  card.products.push(product);
  card.totalPrice += product.price;
  await card.save();
  return card;
};

cardSchema.statics.remove = async function(userId, productId) {
  let card = await this.findOne({ user: userId });
  if (!card) {
    throw new Error("Card not found");
  }
  const index = card.products.findIndex(product => product._id.toString() === productId);
  if (index === -1) {
    throw new Error("product not found in card");
  }
  const removedProduct = card.products.splice(index, 1)[0];
  card.totalPrice -= removedProduct.price;
  await card.save();
  return card;
};

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
