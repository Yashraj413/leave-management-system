const AppError = require('../utils/AppError');

// Generic Zod-based validation middleware factory.
// Usage: router.post('/x', validate(schema), controller)
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return next(new AppError(message, 400));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
