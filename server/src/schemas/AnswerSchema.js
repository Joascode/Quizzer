import { Schema } from 'mongoose';

export default new Schema({
  teamId: {
    type: Schema.Types.ObjectId
  },
  questionId: {
    type: Schema.Types.ObjectId
  },
  answer: String,
  correct: {
    type: Boolean,
    default: false
  },
  _version: {
    type: Number,
    default: 1
  }
});
