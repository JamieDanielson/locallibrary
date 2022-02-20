const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OwnedSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
  status: {
    type: String,
    required: true,
    enum: ['Owned', 'Not Owned'],
    default: 'Not Owned',
  },
});

// Virtual for owned URL
OwnedSchema.virtual('url').get(function () {
  return '/catalog/owned/' + this._id;
});

//Export model
module.exports = mongoose.model('Owned', OwnedSchema);
