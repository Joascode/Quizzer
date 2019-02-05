import { Schema } from 'mongoose';

export default new Schema({
  question: String,
  answer: String,
  category: { type: Schema.Types.ObjectId, ref: 'Category' }
});
