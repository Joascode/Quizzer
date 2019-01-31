import { Schema } from 'mongoose';

export const QuestionSchema = new Schema({
  question: String,
  answer: String,
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
});
