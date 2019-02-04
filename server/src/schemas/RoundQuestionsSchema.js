import { Schema } from 'mongoose';
import { AnswerSchema } from './AnswerSchema';

export const RoundQuestionsSchema = new Schema({
  questionId: Schema.Types.ObjectId,
  roundNr: Schema.Types.ObjectId,
  answers: [AnswerSchema],
});
