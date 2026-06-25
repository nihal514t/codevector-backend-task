const pool = require("../db");

const DEFAULT_LIMIT = 20;

function encodeCursor(product) {
  return Buffer.from(
    JSON.stringify({
      updated_at: product.updated_at,
      id: product.id,
    }),
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

    limit = Math.min(limit, 100);
    const category = req.query.category;
    const cursor = req.query.cursor;

    let query = `
      SELECT *
      FROM products
    `;

    const values = [];
    const conditions = [];

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    if (cursor) {
      let decoded;

      try {
        decoded = decodeCursor(cursor);
      } catch {
        return res.status(400).json({
          message: "Invalid cursor",
        });
      }

      values.push(decoded.updated_at);
      values.push(decoded.id);

      conditions.push(
        `(updated_at, id) < ($${values.length - 1}, $${values.length})`,
      );
    }

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
      nextCursor = encodeCursor(result.rows[result.rows.length - 1]);
    }

    res.json({
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
