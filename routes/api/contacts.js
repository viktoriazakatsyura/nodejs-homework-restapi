const express = require('express');

const ctrl = require("../../controllers/contacts");

const {validateBody, authenticate} = require('../../middlewares');
const {schemas} = require("../../models/contacts");

const router = express.Router();

router.get("/", authenticate, ctrl.getAll)

router.get("/:contactId", authenticate, ctrl.getById);

router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.add);

router.put("/", authenticate, validateBody(schemas.addSchema), ctrl.updateById);
router.patch(
  "/:id/favorite",
  authenticate,
  validateBody(schemas.addSchema),
  ctrl.updateFavorite
)

router.delete("/:contactId", authenticate, ctrl.deleteById);

module.exports = router;
