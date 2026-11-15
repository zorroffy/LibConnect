function notFound(req, res) {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message;

  if (err.name === 'ValidationError') {
    status = 400;
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }
  if (err.code === 11000) {
    status = 409;
    message = `Duplicate value: ${JSON.stringify(err.keyValue)}`;
  }

  if (status >= 500) console.error('[error]', err);

  const showErrors = status < 500 || process.env.NODE_ENV !== 'production';
  res.status(status).json({ error: showErrors ? message || 'Internal Server Error' : 'Internal Server Error' });
}

module.exports = { notFound, errorHandler };
