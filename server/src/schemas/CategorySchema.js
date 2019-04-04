import { Schema } from 'mongoose';

export default new Schema({
  category: {
    type: String,
    required: true
  }
});
