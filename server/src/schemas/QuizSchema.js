import { Schema } from 'mongoose';
import RoundSchema from './RoundSchema';
import TeamSchema from './TeamSchema';

// TODO: Add validation https://mongoosejs.com/docs/validation.html
export default new Schema({
  name: {
    type: String,
    min: 1,
    required: true
  },
  password: {
    default: '',
    type: String
  },
  open: {
    default: true,
    type: Boolean,
    required: true
  },
  teams: {
    default: [],
    type: [TeamSchema]
  },
  rounds: {
    default: [],
    type: [RoundSchema],
    required: true
  }
});
