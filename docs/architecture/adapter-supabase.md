# Architecture: @repo/adapter-supabase

**Notes:** this package has less priority and is currently not developed.

## 1. Package Purpose
The `adapter-supabase` package acts as the **BaaS (Backend-as-a-Service) Infrastructure Adapter**. It implements the `IVisitorRepository` interface defined in `@repo/domain-visitors` using the `@supabase/supabase-js` client. 

**CRITICAL RULE:** This package must never import from `graphql` or `express`. It sits at the edge of the architecture, translating domain repository calls into Supabase Data API REST calls.

## 2. Core Concepts & Files

### 2.1 The Supabase Repository (`SupabaseVisitorRepository.ts`)
* **Behavior:** Implements the `IVisitorRepository` contract. 
* **Mechanism:** Instead of executing raw SQL (like Drizzle), it uses the Supabase SDK (e.g., `supabase.from('visitors').insert(...)`) which communicates over HTTP to the PostgREST API.

### 2.2 The Data Mapper
* **Behavior:** Supabase returns data in JSON format matching its database rows. The repository must use a `toDomain` method to map this JSON into the pure `VisitorEntity` and `VisitLogEntity` shapes required by the domain, ensuring complete decoupling from Supabase's specific timestamp formats or internal IDs.

## 3. AI Agent Instructions
When modifying or interacting with `@repo/adapter-supabase`, the AI must follow these rules:
1. **Client Isolation:** The `createClient()` instantiation should ideally happen once in the Composition Root (`backend-node`) and the client instance should be passed into this repository's constructor, matching the pattern used by Drizzle and Mongo.
2. **Handle Network Errors:** Because this adapter communicates over HTTP rather than a persistent TCP connection pool, it must gracefully catch and map `fetch` errors or Supabase specific API errors into generic JavaScript errors for the Domain layer to handle.
