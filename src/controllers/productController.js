const pool = require("../db");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function encodeCursor(product, snapshot) {
  return Buffer.from(
    JSON.stringify({
      updated_at: product.updated_at,
      id: product.id,
      snapshot,
    })
  ).toString("base64");
}

function decodeCursor(cursor) {
  return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
}

async function getProducts(req, res) {
  try {
    let limit = parseInt(req.query.limit, 10);

    if (isNaN(limit) || limit <= 0) {
      limit = DEFAULT_LIMIT;
    }

    limit = Math.min(limit, MAX_LIMIT);

    const { category, cursor } = req.query;

    let snapshot = new Date().toISOString();

    const conditions = [];
    const values = [];

    // Category filter
    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    // First request vs subsequent requests
    if (cursor) {
      let decoded;

      try {
        decoded = decodeCursor(cursor);
      } catch {
        return res.status(400).json({
          message: "Invalid cursor",
        });
      }

      snapshot = decoded.snapshot;

      // Freeze dataset to snapshot
      values.push(snapshot);
      conditions.push(`updated_at <= $${values.length}`);

      // Cursor pagination
      values.push(decoded.updated_at);
      const updatedAtIndex = values.length;

      values.push(decoded.id);
      const idIndex = values.length;

      conditions.push(
        `(updated_at, id) < ($${updatedAtIndex}, $${idIndex})`
      );
    } else {
      // First page: establish snapshot
      values.push(snapshot);
      conditions.push(`updated_at <= $${values.length}`);
    }

    let query = `
      SELECT *
      FROM products
    `;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    values.push(limit);

    query += `
      ORDER BY updated_at DESC, id DESC
      LIMIT $${values.length}
    `;

    const result = await pool.query(query, values);

    let nextCursor = null;

    if (result.rows.length > 0) {
      nextCursor = encodeCursor(
        result.rows[result.rows.length - 1],
        snapshot
      );
    }

    res.status(200).json({
      products: result.rows,
      nextCursor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  getProducts,
};