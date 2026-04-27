import { NODE_GRAPHQL_URL, NODE_HEADERS, SUPABASE_GRAPHQL_ENDPOINT, SUPABASE_HEADERS } from "../config/constants";

/**
 * Helper to register visitor in Node.js / Neon
 */
export const registerNodeJsVisitor = async (id: string) => {
  await fetch(NODE_GRAPHQL_URL, {
    method: 'POST',
    headers: NODE_HEADERS,
    body: JSON.stringify({
      query: `
        mutation RegisterVisitor($id: ID!) {
          registerVisitor(id: $id) { id }
        }
      `,
      variables: { id }
    })
  });
};

/**
 * Helper to register visitor directly in Supabase
 */
export const registerSupabaseVisitor = async (id: string) => {
  const response = await fetch(SUPABASE_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: SUPABASE_HEADERS,
    body: JSON.stringify({
      query: `
        mutation InsertVisitor($id: UUID!) {
          insertIntovisitorsCollection(objects: [{ id: $id }]) {
            records { id }
          }
        }
      `,
      variables: { id }
    })
  });

  const result = await response.json();

  const supabaseVisitorId = result.data.insertIntovisitorsCollection.records[0].id;
  return supabaseVisitorId;
};
