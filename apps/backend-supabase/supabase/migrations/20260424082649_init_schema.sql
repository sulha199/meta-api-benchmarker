-- Create the Environment Enum
CREATE TYPE environment AS ENUM ('Node.js', 'Supabase');

-- Create Visitors Table
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Visit Logs Table
CREATE TABLE visit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    locale TEXT NOT NULL,
    user_agent TEXT,
    visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Benchmarks Table
CREATE TABLE benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    environment environment NOT NULL,
    payload_size_kb INTEGER NOT NULL,
    total_roundtrip_ms INTEGER,
    backend_parse_ms INTEGER,
    backend_db_insert_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments for GraphQL (PostgREST and pg_graphql use these for auto-documentation)
COMMENT ON TABLE visitors IS 'Stores unique visitor identities and optional emails.';
COMMENT ON TABLE visit_logs IS 'Tracks visitor engagement and localization data.';
COMMENT ON TABLE benchmarks IS 'The core data for our performance comparison.';
