const fs = require('fs');
const path = require('path');

const target = process.argv[2];
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

if (!target || (target !== 'sqlite' && target !== 'postgres')) {
  console.error('Usage: node switch-db.js [sqlite|postgres]');
  process.exit(1);
}

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');

  if (target === 'sqlite') {
    schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
    console.log('Switched Prisma database provider to SQLite');
  } else {
    schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    console.log('Switched Prisma database provider to PostgreSQL');
  }

  fs.writeFileSync(schemaPath, schema, 'utf8');
} catch (error) {
  console.error('Error switching database provider:', error);
  process.exit(1);
}
