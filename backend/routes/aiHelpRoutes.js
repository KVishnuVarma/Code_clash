const express = require("express");
const router = express.Router();
const aiHelpController = require("../controllers/aiHelpController");

// POST /api/aihelp/error-fix
router.post("/error-fix", aiHelpController.errorFix);

// POST /api/aihelp/review
router.post("/review", aiHelpController.review);

// POST /api/aihelp/discussion
router.post("/discussion", aiHelpController.discussion);

module.exports = router; 