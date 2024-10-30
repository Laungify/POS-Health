const express = require("express");
const router = express.Router();
const ExpenseController = require("../controllers/expense");

router.post("/", ExpenseController.create);

router.patch("/:expenseId", ExpenseController.update);

router.delete("/:expenseId", ExpenseController.delete);

module.exports = router;
