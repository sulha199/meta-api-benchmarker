import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

const typeDefs = `
  type Query {
    ping: String!
  }
`;

const resolvers = {
  Query: {
    ping: () => 'POC Backend Node.js di Vercel Berhasil!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// Vercel Serverless Function menggunakan format req/res yang sama dengan Next.js
export default startServerAndCreateNextHandler(server);
