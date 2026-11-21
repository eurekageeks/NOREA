import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/** Runs after express-validator chains; returns 422 with field errors. */
const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = {};
  for (const e of result.array({ onlyFirstError: true })) {
    errors[e.path] = e.msg;
  }
  const err = new ApiError(422, 'Please correct the highlighted fields.', errors);
  next(err);
};

export default validate;
