const express = require("express");
const pool = require("./db");

const app = express();

const productRoutes = require("./routes/productRoutes");

app.use(express.json());

app.use("/products", productRoutes);

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
