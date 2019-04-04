import { Schema } from 'mongoose';

export default new Schema({
  number: {
    default: 1,
    type: Number,
    required: true
  },
  // currentQuestion: {
  //   question: { type: Schema.Types.ObjectId, ref: 'Question' },
  //   answers: { type: [AnswerSchema], default: [] },
  // },
  teamScores: {
    type: [
      {
        teamId: {
          type: Schema.Types.ObjectId,
          required: true
        },
        score: {
          type: Number,
          default: 0,
          required: true
        }
      }
    ],
    default: []
  },
  questions: {
    type: [
      {
        question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        answers: {
          type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
          default: [],
          required: true
        }
      }
    ],
    default: []
  },
  selectedCategories: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    default: [],
    required: true
  }
});
