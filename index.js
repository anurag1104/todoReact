import express from 'express'
import cors from 'cors';
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const {Pool} = pg;

const app = express();
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Routes
app.get('/api/todos', async (req, res) => {
  const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
  res.json(result.rows);
});

app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  console.log(req.body);
  const result = await pool.query('INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *', [text, false]);
  res.json(result.rows[0]);
});

app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const result = await pool.query('UPDATE todos SET completed=$1 WHERE id=$2 RETURNING *', [completed, id]);
  res.json(result.rows[0]);
});

app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM todos WHERE id=$1', [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//test db connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('❌ Failed to connect to the database', err);
    process.exit(1); // Exit if DB is not reachable
  });