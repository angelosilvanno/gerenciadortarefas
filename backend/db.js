const { Pool, types } = require("pg");
require('dotenv').config();

types.setTypeParser(types.builtins.TIMESTAMP, (stringValue) => {
  return stringValue;
});
types.setTypeParser(types.builtins.TIMESTAMPTZ, (stringValue) => {
  return stringValue;
});

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = isProduction 
    ? process.env.DATABASE_URL 
    : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;