const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { ctrlWrapper, HttpError } = require("../helpers/index");

require("dotenv").config();
const secret = process.env.SECRET_KEY;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });

  const id = newUser._id;
  const token = jwt.sign({ id }, secret, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });

  res.status(201).json({
    token,
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const compareResult = await bcrypt.compare(password, user.password);

  if (!compareResult) {
    throw HttpError(401, "Email or password is wrong");
  }

  const id = user._id;
  const token = jwt.sign({ id }, secret, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });
  res.status(201).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).end();
};
const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    user: {
      email,
      subscription,
    },
  });
};
const updateSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  res.json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent,
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
};