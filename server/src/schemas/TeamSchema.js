import { Schema } from 'mongoose';

function minTeamMembers(val) {
  return val.length >= 2;
}

function maxTeamMembers(val) {
  return val.length <= 5;
}

const validators = [
  { validator: minTeamMembers, msg: '{PATH} does not exceeds the limit of 2' },
  { validator: maxTeamMembers, msg: '{PATH} does exceeds the limit of 5' }
];

export default new Schema({
  name: {
    type: String,
    required: true,
    minLength: 1
  },
  members: {
    type: [String],
    required: true,
    validate: validators
  },
  score: {
    type: Number,
    default: 0
  }
});
