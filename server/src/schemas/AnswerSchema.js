import { Schema } from 'mongoose';

export default new Schema({
  quizId: {
    required: true,
    type: Schema.Types.ObjectId
  },
  teamId: {
    required: true,
    type: Schema.Types.ObjectId
  },
  questionId: {
    required: true,
    type: Schema.Types.ObjectId
  },
  roundNr: {
    type: Number,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  correct: {
    type: Boolean,
    default: false,
    required: true
  },
  _version: {
    type: Number,
    default: 1,
    required: true
  }
});
