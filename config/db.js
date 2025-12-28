const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const connectDB = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL database");
    console.log("📅 Database time:", result.rows[0].now);
    await createTables();
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};

const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPropertiesTable = `
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      location VARCHAR(255) NOT NULL,
      bedrooms INTEGER,
      bathrooms INTEGER,
      area DECIMAL(10, 2),
      property_type VARCHAR(100),
      status VARCHAR(50) DEFAULT 'available',
      images TEXT[],
      amenities TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createPropertiesTable);
    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
  }
};

module.exports = { pool, connectDB };
