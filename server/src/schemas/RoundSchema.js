import { Schema } from 'mongoose';

export default new Schema({
  number: {
    default: 1,
    type: Number
  },
  // currentQuestion: {
  //   question: { type: Schema.Types.ObjectId, ref: 'Question' },
  //   answers: { type: [AnswerSchema], default: [] },
  // },
  questions: {
    type: [
      {
        question: { type: Schema.Types.ObjectId, ref: 'Question' },
        answers: { type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }], default: [] }
      }
    ],
    default: []
  },
  selectedCategories: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    default: []
  }
});
