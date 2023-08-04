const express = require('express');

const ctrl = require("../../controllers/contacts");

const {validateBody} = require('../../middlewares');
const {schemas} = require("../../models/contacts");

const router = express.Router();

router.get("/", ctrl.getAll)

router.get("/:contactId", ctrl.getById);

router.post("/", validateBody(schemas.addSchema), ctrl.add);

router.put("/", validateBody(schemas.addSchema), ctrl.updateById);
router.patch(
  "/:id/favorite",
  validateBody(schemas.addSchema),
  ctrl.updateFavorite
)

router.delete("/:contactId", ctrl.deleteById);

module.exports = router;
