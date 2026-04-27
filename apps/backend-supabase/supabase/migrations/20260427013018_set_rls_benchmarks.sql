-- Reenable RLS
ALTER TABLE "benchmarks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "visitors" ENABLE ROW LEVEL SECURITY;

-- Enable(anon) to do INSERT
CREATE POLICY "Allow anonymous inserts on benchmarks"
ON "benchmarks"
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on visitors"
ON "visitors"
FOR INSERT TO anon WITH CHECK (true);
