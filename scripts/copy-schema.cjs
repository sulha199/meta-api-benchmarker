const fs = require('fs');
const path = require('path');

const schemaPath = path.join(process.cwd(), 'src/graphql/schema.graphql');
const outJs = path.join(process.cwd(), 'dist/graphql/schema.js');
const outDts = path.join(process.cwd(), 'dist/graphql/schema.d.ts');

if (fs.existsSync(schemaPath)) {
  const content = fs.readFileSync(schemaPath, 'utf8');
  fs.mkdirSync(path.dirname(outJs), { recursive: true });
  fs.writeFileSync(outJs, 'export default `' + content.replace(/`/g, '\\`') + '`;\n');
  fs.writeFileSync(outDts, 'declare const schema: string;\nexport default schema;\n');
  console.log(`Generated schema exports for ${path.basename(process.cwd())}`);
}
