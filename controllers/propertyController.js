const { pool } = require("../config/db");

// GET /api/properties
exports.getProperties = async (req, res) => {
  try {
    const {
      propertyType,
      listingType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      condition,
      page = 1,
      limit = 12,
    } = req.query;

    const conditions = ["status = 'AVAILABLE'"];
    const values = [];

    if (propertyType) {
      values.push(propertyType);
      conditions.push(`property_type = $${values.length}`);
    }

    if (listingType) {
      values.push(listingType);
      conditions.push(`listing_type = $${values.length}`);
    }

    if (city) {
      values.push(`%${city}%`);
      conditions.push(`city ILIKE $${values.length}`);
    }

    if (condition) {
      values.push(condition);
      conditions.push(`condition = $${values.length}`);
    }

    if (bedrooms) {
      values.push(Number(bedrooms));
      conditions.push(`bedrooms >= $${values.length}`);
    }

    if (bathrooms) {
      values.push(Number(bathrooms));
      conditions.push(`bathrooms >= $${values.length}`);
    }

    if (minPrice) {
      values.push(Number(minPrice));
      conditions.push(`price >= $${values.length}`);
    }

    if (maxPrice) {
      values.push(Number(maxPrice));
      conditions.push(`price <= $${values.length}`);
    }

    if (minArea) {
      values.push(Number(minArea));
      conditions.push(`area >= $${values.length}`);
    }

    if (maxArea) {
      values.push(Number(maxArea));
      conditions.push(`area <= $${values.length}`);
    }

    const offset = (page - 1) * limit;
    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const listQuery = `
      SELECT *
      FROM properties
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM properties
      ${whereClause}
    `;

    const properties = await pool.query(listQuery, [...values, limit, offset]);
    const total = await pool.query(countQuery, values);

    res.json({
      properties: properties.rows,
      total: Number(total.rows[0].count),
      totalPages: Math.ceil(total.rows[0].count / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

// GET /api/properties/:id
exports.getPropertyById = async (req, res) => {
  const id = Number(req.params.id);

  const result = await pool.query(
    `UPDATE properties SET views = views + 1 WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json(result.rows[0]);
};

// POST /api/properties
exports.createProperty = async (req, res) => {
  const data = req.body;
  const keys = Object.keys(data);
  const values = Object.values(data);

  const placeholders = keys.map((_, i) => `$${i + 1}`);

  const query = `
    INSERT INTO properties (${keys.join(", ")}, status)
    VALUES (${placeholders.join(", ")}, 'AVAILABLE')
    RETURNING *
  `;

  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
};

// PUT /api/properties/:id
exports.updateProperty = async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;

  const keys = Object.keys(data);
  const values = Object.values(data);

  const setClause = keys
    .map((k, i) => `${k} = $${i + 1}`)
    .join(", ");

  const result = await pool.query(
    `UPDATE properties SET ${setClause}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json(result.rows[0]);
};

// DELETE /api/properties/:id
exports.deleteProperty = async (req, res) => {
  const id = Number(req.params.id);

  const result = await pool.query(
    "DELETE FROM properties WHERE id = $1 RETURNING id",
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json({ message: "Property removed" });
};

// GET /api/properties/featured
exports.getFeaturedProperties = async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM properties
     WHERE featured = true AND status = 'AVAILABLE'
     ORDER BY created_at DESC
     LIMIT 6`
  );

  res.json(result.rows);
};
