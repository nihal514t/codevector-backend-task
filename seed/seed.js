const pool = require("../src/db");

const TOTAL_PRODUCTS = 200000;
const BATCH_SIZE = 5000;

const categories = [
  "Electronics",
  "Books",
  "Fashion",
  "Sports",
  "Furniture",
  "Toys"
];

function getRandomCategory() {
  return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomPrice() {
  return (Math.random() * 9900 + 100).toFixed(2);
}

function getRandomDate() {
  const now = new Date();
  const oneYearAgo = new Date();

  oneYearAgo.setFullYear(now.getFullYear() - 1);

  return new Date(
    oneYearAgo.getTime() +
      Math.random() * (now.getTime() - oneYearAgo.getTime())
  );
}

function generateProduct(index) {
  const date = getRandomDate();

  return {
    name: `Product ${index}`,
    category: getRandomCategory(),
    price: getRandomPrice(),
    created_at: date,
    updated_at: date,
  };
}

async function insertBatch(startIndex) {
  const products = [];

  for (let i = 0; i < BATCH_SIZE && startIndex + i <= TOTAL_PRODUCTS; i++) {
    products.push(generateProduct(startIndex + i));
  }

  const values = [];
  const placeholders = [];

  products.forEach((product, index) => {
    const offset = index * 5;

    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`
    );

    values.push(
      product.name,
      product.category,
      product.price,
      product.created_at,
      product.updated_at
    );
  });

  const query = `
    INSERT INTO products
    (name, category, price, created_at, updated_at)
    VALUES
    ${placeholders.join(",")}
  `;

  await pool.query(query, values);

  console.log(
    `Inserted ${Math.min(
      startIndex + products.length - 1,
      TOTAL_PRODUCTS
    )} / ${TOTAL_PRODUCTS}`
  );
}

async function seedDatabase() {
  try {
    console.log("Seeding started...\n");

    await pool.query("TRUNCATE TABLE products RESTART IDENTITY");

    for (
      let start = 1;
      start <= TOTAL_PRODUCTS;
      start += BATCH_SIZE
    ) {
      await insertBatch(start);
    }

    console.log("\n✅ Successfully inserted 200000 products.");
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

seedDatabase();