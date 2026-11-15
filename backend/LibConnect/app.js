const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandlers');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

  app.get('/api', (_req, res) => {
    res.json({
      name: 'LibConnect API',
      status: 'running',
      endpoints: {
        auth: ['POST /api/auth/signup', 'POST /api/auth/signin', 'GET /api/auth/me'],
        users: ['GET /api/users', 'POST /api/users', 'GET /api/users/:id', 'PUT /api/users/:id', 'DELETE /api/users/:id'],
        books: ['GET /api/books', 'GET /api/books/:id', 'POST /api/books', 'PUT /api/books/:id', 'DELETE /api/books/:id'],
        loans: ['GET /api/loans', 'GET /api/loans/mine', 'GET /api/loans/:id', 'POST /api/loans', 'PUT /api/loans/:id', 'DELETE /api/loans/:id'],
      },
    });
  });

  // Serve the front end (frontend/ folder) if it exists; harmless if it doesn't
  app.use(express.static('frontend'));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/loans', loanRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
