const {Schema, model} = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const userSchema = new Schema({
    password: {
      type: String,
      required: [true, 'Set password for user'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter"
    },
    token: String
  },
  {versionKey: false, timestamps: true})

  userSchema.post("save", function (doc) {
    handleMongooseError(doc); 
  });

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    subscription: Joi.string(),
  });

  const updateSchema = Joi.object({
    subscription: Joi.string().allow("starter", "pro", "business"),
  })

  const schemas = {
    schema,
    updateSchema
  }
  const User = model("user", userSchema);

  module.exports ={
    User,
    schemas
  }