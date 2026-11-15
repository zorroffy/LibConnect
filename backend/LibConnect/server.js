require('dotenv').config();
const connectDB = require('./config/db');
const createApp = require('./app');

const PORT = process.env.PORT || 5000;

async function launch() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  }
  await connectDB();
  createApp().listen(PORT, () => console.log(`[server] Listening on http://localhost:${PORT}`));
}

launch().catch((err) => {
  console.error('[startup] Failed:', err.message);
  process.exit(1);
});
