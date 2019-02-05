import { Schema } from 'mongoose';

export default new Schema({
  questionId: Schema.Types.ObjectId,
  teamId: Schema.Types.ObjectId,
  answer: String,
  _version: Number
});
