import { Schema } from 'mongoose';

export default new Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
});
