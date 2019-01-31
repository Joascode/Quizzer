import { Schema } from 'mongoose';
import { AnswerSchema } from './AnswerSchema';

export const RoundSchema = new Schema({
  number: {
    default: 1,
    type: Number,
  },
  currentQuestion: {
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    answers: { type: [AnswerSchema], default: [] },
  },
  questions: {
    type: [
      {
        question: { type: Schema.Types.ObjectId, ref: 'Question' },
        answers: { type: [AnswerSchema], default: [] },
      },
    ],
    default: [],
  },
  selectedCategories: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    default: [],
  },
});
