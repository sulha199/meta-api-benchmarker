import mongoose, { Schema } from 'mongoose';

export const CommentSchema = new Schema({
  articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
  authorId: { type: String, required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ArticleSchema = new Schema({
  title: { type: String, required: true },
  contentBody: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define the Virtual Relation
ArticleSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'articleId'
});

export const ArticleModel = mongoose.model('Article', ArticleSchema);
export const CommentModel = mongoose.model('Comment', CommentSchema);
