import { Resolvers } from "./__generated__/resolvers-types";
import type { VisitorEntity } from "../repositories/IVisitorRepository";

export const resolvers: Resolvers = {
  Query: {
    getVisitor: async (_, { id }, context) => {
      const repository = context.repositories.visitors.postgres; // Now correctly typed
      return repository.findById(id);
    },
    ping: () => "Pong! Competitor A is ready.",
  },
  Mutation: {
    registerVisitor: async (_, { id, rawEmail }, context) => {
      const repository = context.repositories.visitors.postgres; // Now correctly typed
      // For creation, we need to ensure the entity matches the VisitorEntity type, even with partial data
      const newVisitor: VisitorEntity = {
        id,
        rawEmail: rawEmail || null, // rawEmail can be null
        logs: [], // Initialize with empty logs
        createdAt: new Date().toISOString(),
      };
      const created = await repository.registerVisitor(newVisitor);
      if (!created) {
        throw new Error("Failed to register visitor");
      }
      return created;
    },
    updateVisitor: async (_, { id, rawEmail }, context) => {
      const repository = context.repositories.visitors.postgres;
      const updatedVisitor = await repository.update(id, { rawEmail });
      return updatedVisitor;
    },
    deleteVisitor: async (_, { id }, context) => {
      const repository = context.repositories.visitors.postgres;
      return repository.delete(id);
    },
  },
};
