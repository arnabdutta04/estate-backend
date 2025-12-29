const { pool } = require("../config/db");

/**
 * GET /api/brokers
 * Public
 */
exports.getBrokers = async (req, res) => {
  try {
    const { city, specialization, minRating } = req.query;

    const conditions = [];
    const values = [];

    // Only verified brokers
    conditions.push("b.verified = true");

    if (minRating) {
      values.push(Number(minRating));
      conditions.push(`b.rating >= $${values.length}`);
    }

    if (specialization) {
      values.push(specialization.toUpperCase());
      conditions.push(`$${values.length} = ANY(b.specialization)`);
    }

    if (city) {
      values.push(city);
      conditions.push(`$${values.length} = ANY(b.serving_areas)`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        b.*,
        u.name,
        u.email,
        u.phone
      FROM brokers b
      JOIN users u ON u.id = b.user_id
      ${whereClause}
      ORDER BY b.rating DESC
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("getBrokers error:", error.message);
    res.status(500).json({ message: "Failed to fetch brokers" });
  }
};

/**
 * GET /api/brokers/:id
 * Public
 */
exports.getBrokerById = async (req, res) => {
  try {
    const brokerId = Number(req.params.id);

    const brokerResult = await pool.query(
      `
      SELECT 
        b.*,
        u.name,
        u.email,
        u.phone
      FROM brokers b
      JOIN users u ON u.id = b.user_id
      WHERE b.id = $1
      `,
      [brokerId]
    );

    if (brokerResult.rows.length === 0) {
      return res.status(404).json({ message: "Broker not found" });
    }

    const propertiesResult = await pool.query(
      "SELECT * FROM properties WHERE broker_id = $1",
      [brokerId]
    );

    res.json({
      ...brokerResult.rows[0],
      properties: propertiesResult.rows,
    });
  } catch (error) {
    console.error("getBrokerById error:", error.message);
    res.status(500).json({ message: "Failed to fetch broker" });
  }
};

/**
 * POST /api/brokers
 * Private (JWT required)
 */
exports.createBroker = async (req, res) => {
  try {
    const {
      company,
      licenseNumber,
      experience,
      specialization,
      servingAreas,
    } = req.body;

    const userId = req.user.id;

    const existing = await pool.query(
      "SELECT id FROM brokers WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Broker profile already exists" });
    }

    const specArray = Array.isArray(specialization)
      ? specialization.map((s) => s.toUpperCase())
      : [specialization.toUpperCase()];

    const areasArray = servingAreas || [];

    const result = await pool.query(
      `
      INSERT INTO brokers
        (user_id, company, license_number, experience, specialization, serving_areas)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [userId, company, licenseNumber, experience, specArray, areasArray]
    );

    // Update user role
    await pool.query(
      "UPDATE users SET role = 'BROKER' WHERE id = $1",
      [userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("createBroker error:", error.message);
    res.status(500).json({ message: "Failed to create broker" });
  }
};
