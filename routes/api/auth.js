const express = require("express");
const ctrl = require("../../controllers/auth");
const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

router.post("/register", validateBody(schemas.schema), ctrl.register);
router.post("/login", validateBody(schemas.schema), ctrl.login);
router.post("/logout", authenticate, ctrl.logout);
router.get("/current", authenticate, ctrl.getCurrent);
router.patch("/", authenticate, validateBody(schemas.updateSchema), ctrl.updateSubscription);


module.exports = router;

