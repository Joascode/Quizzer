import { Schema } from 'mongoose';

export default new Schema({
  quizId: {
    type: Schema.Types.ObjectId
  },
  teamId: {
    type: Schema.Types.ObjectId
  },
  questionId: {
    type: Schema.Types.ObjectId
  },
  roundNr: Number,
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
