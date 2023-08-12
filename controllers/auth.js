const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");

const { User } = require("../models/user");
const { ctrlWrapper, HttpError, sendEmail } = require("../helpers/index");
const path = require("path");

require("dotenv").config();
const secret = process.env.SECRET_KEY;
const baseUrl = process.env.BASE_URL;

const register = ctrlWrapper(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw new HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify your email",
    html: `<a target="_blank" href="${baseUrl}/api/auth/verify/${verificationToken}">Click to verify email</a>`,
  };
  await sendEmail(verifyEmail);

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
});

const login = ctrlWrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const compareResult = await bcrypt.compare(password, user.password);

  if (!compareResult) {
    throw new HttpError(401, "Email or password is wrong");
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
});

const logout = ctrlWrapper(async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).end();
});

const getCurrent = ctrlWrapper(async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    user: {
      email,
      subscription,
    },
  });
});

const updateSubscription = ctrlWrapper(async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(_id, { subscription }, { new: true });
  res.json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
});

const updateAvatar = ctrlWrapper(async (req, res) => {
  const { _id } = req.user;

  const avatarDir = path.join(__dirname, "../public/avatars");
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${nanoid()}${path.extname(originalname)}`;
  const resultUpload = path.join(avatarDir, filename);

  await Jimp.read(tempUpload)
    .then((night) => night.resize(250, 250).write(resultUpload))
    .catch((e) => {
      console.error(e);
      throw new HttpError(500, "Avatar processing error");
    });

  await fs.unlink(tempUpload);

  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  });
});

const verify = ctrlWrapper(async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verified: true,
    verificationToken: "",
  });

  res.json({
    message: "Verification successful",
  });
});

const resendVerifyEmail = ctrlWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (user.verified) {
    throw new HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify your email",
    html: `<a target="_blank" href="${baseUrl}/api/auth/verify/${user.verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
});

module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
  verify,
  resendVerifyEmail,
};
