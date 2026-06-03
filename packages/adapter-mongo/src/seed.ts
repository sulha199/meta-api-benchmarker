import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";

// Look for .env in the monorepo root
config({ path: resolve(process.cwd(), "../../.env") });
import { faker } from "@faker-js/faker";
import { ArticleModel, CommentModel } from "./schema/models";

const NUM_ARTICLES = 1000;
const COMMENTS_PER_ARTICLE = 10;
const BATCH_SIZE = 100;

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in .env");
  }

  console.log("🌱 Starting MongoDB Seeding...");

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    console.log("🧹 Clearing old data...");
    await ArticleModel.deleteMany({});
    await CommentModel.deleteMany({});

    console.log(`📝 Inserting ${NUM_ARTICLES} articles...`);

    const articles = [];
    for (let i = 0; i < NUM_ARTICLES; i++) {
      articles.push({
        title: faker.book.title(),
        contentBody: faker.lorem.paragraphs(3),
      });
    }

    // Insert in batches
    let insertedArticles: any[] = [];
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE);
      const result = await ArticleModel.insertMany(batch);
      insertedArticles = insertedArticles.concat(result);
      console.log(
        `   ...inserted ${insertedArticles.length} / ${NUM_ARTICLES} articles`,
      );
    }

    console.log(
      `💬 Generating ${NUM_ARTICLES * COMMENTS_PER_ARTICLE} comments...`,
    );

    const comments = [];
    for (const article of insertedArticles) {
      for (let i = 0; i < COMMENTS_PER_ARTICLE; i++) {
        comments.push({
          articleId: article._id,
          authorId: faker.internet.username(),
          commentText: faker.lorem.sentence(),
        });
      }
    }

    console.log("🚀 Batch inserting comments...");
    for (let i = 0; i < comments.length; i += BATCH_SIZE * 5) {
      const batch = comments.slice(i, i + BATCH_SIZE * 5);
      await CommentModel.insertMany(batch);
      console.log(
        `   ...inserted ${Math.min(i + batch.length, comments.length)} / ${comments.length} comments`,
      );
    }

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
