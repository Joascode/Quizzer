import { Schema } from 'mongoose';
import RoundSchema from './RoundSchema';
import { TeamSchema } from './TeamSchema';

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
    type: [
      // {
      //   name: {
      //     type: String,
      //     required: true,
      //     minLength: 1,
      //   },
      //   members: {
      //     type: [String],
      //   },
      // },
      // { type: Schema.Types.ObjectId, ref: 'Team' },
      TeamSchema
    ],
    maxItems: 8 // TODO: Is not a valid validator, only checks string length.
  },
  rounds: {
    default: [],
    type: [RoundSchema],
    required: true
  }
  // questions: {
  //   type: [RoundQuestionsSchema],
  //   default: [],
  // },
});
