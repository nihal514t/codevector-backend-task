const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});