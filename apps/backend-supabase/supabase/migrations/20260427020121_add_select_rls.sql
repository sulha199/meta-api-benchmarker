CREATE POLICY "Allow anonymous select on benchmarks"
ON "benchmarks"
FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous select on visitors"
ON "visitors"
FOR SELECT TO anon USING (true);
