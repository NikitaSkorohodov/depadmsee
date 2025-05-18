const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
  ]
});

favoriteSchema.statics.fetchByUser = async function(userId) {
  return this.findOne({ user: userId });
};

favoriteSchema.statics.add = async function(userId, product) {
  let favorite = await this.findOne({ user: userId });
  if (!favorite) {
    favorite = new this({ user: userId });
  }
  favorite.products.push(product);
  await favorite.save();
  return favorite;
};

favoriteSchema.statics.remove = async function(userId, productId) {
  let favorite = await this.findOne({ user: userId });
  if (!favorite) {
    throw new Error("Favorites not found");
  }
  const index = favorite.products.findIndex(product => product._id.toString() === productId);
  if (index === -1) {
    throw new Error("product not found in favorites");
  }
  favorite.products.splice(index, 1);
  await favorite.save();
  return favorite;
};

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
