import { Schema } from 'mongoose';

export const TeamSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 1,
  },
  members: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} does not exceeds the limit of 2'],
  },
});

function arrayLimit(val) {
  return val.length <= 2;
}
