exports.validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(404).send(error.details[0].message);
  } else {
    next();
  }
};
