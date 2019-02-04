import { Schema } from 'mongoose';
import { AnswerSchema } from './AnswerSchema';

export const RoundQuestions = new Schema({
  vraagId: Schema.Types.ObjectId,
  rondeId: Schema.Types.ObjectId,
  antwoorden: [AnswerSchema]
});
