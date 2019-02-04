import { Schema } from 'mongoose';
import { AnswerSchema } from './AnswerSchema';

export default new Schema({
  // number: {
  //   default: 1,
  //   type: Number,
  // },
  // currentQuestion: {
  //   question: { type: Schema.Types.ObjectId, ref: 'Question' },
  //   answers: { type: [AnswerSchema], default: [] },
  // },
  questions: {
    type: [
      {
        question: { type: Schema.Types.ObjectId, ref: 'Question' },
        answers: { type: [AnswerSchema], default: [] },
        open: {
          type: Boolean,
          default: true
        }
      }
    ],
    default: []
  },
  selectedCategories: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    default: []
  }
});
