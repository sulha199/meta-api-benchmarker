import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';

// 1. Corrected Import Path!
import { astArticles, astComments } from './schema/ast';

// 2. Extract strictly-typed insert signatures from Drizzle
type NewArticle = typeof astArticles.$inferInsert;
type NewComment = typeof astComments.$inferInsert;

const NUM_ARTICLES = 1000;
const COMMENTS_PER_ARTICLE = 10;
const BATCH_SIZE = 1000;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env');
  }

  const queryClient = postgres(process.env.DATABASE_URL);

  // Explicitly passing the schema object helps Drizzle's type inference engine
  const db = drizzle(queryClient, { schema: { astArticles, astComments } });

  console.log('🌱 Starting Database Seeding...');

  try {
    console.log('🧹 Clearing old data...');
    // Because the import path is fixed, db.delete now recognizes these as valid PgTables
    await db.delete(astComments as any);
    await db.delete(astArticles as any);

    console.log(`📝 Inserting ${NUM_ARTICLES} articles...`);

    // 3. Strongly type the array so TypeScript catches any missing fields
    const newArticles: NewArticle[] = [];
    for (let i = 0; i < NUM_ARTICLES; i++) {
      newArticles.push({
        title: faker.book.title(),
        contentBody: faker.lorem.paragraphs(3),
      });
    }

    const insertedArticles = await db
      .insert(astArticles as any)
      .values(newArticles)
      .returning({ id: (astArticles as any).id });

    console.log(`💬 Generating ${NUM_ARTICLES * COMMENTS_PER_ARTICLE} comments...`);

    // 3. Strongly type the comments array
    const newComments: NewComment[] = [];
    for (const article of insertedArticles) {
      for (let i = 0; i < COMMENTS_PER_ARTICLE; i++) {
        newComments.push({
          articleId: article.id,
          authorId: faker.internet.username(),
          commentText: faker.lorem.sentence(),
        });
      }
    }

    console.log('🚀 Batch inserting comments...');
    for (let i = 0; i < newComments.length; i += BATCH_SIZE) {
      const batch = newComments.slice(i, i + BATCH_SIZE);
      await db.insert(astComments as any).values(batch);
      console.log(`   ...inserted ${i + batch.length} / ${newComments.length}`);
    }

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await queryClient.end();
  }
}

main();
