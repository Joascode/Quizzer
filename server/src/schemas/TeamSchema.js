import { Schema } from 'mongoose';

function arrayLimit(val) {
  return val.length >= 2;
}

export default new Schema({
  name: {
    type: String,
    required: true,
    minLength: 1
  },
  members: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} does not exceeds the limit of 2']
  },
  score: {
    type: Number,
    default: 0
  }
});
