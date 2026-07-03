const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { loginSchema };
