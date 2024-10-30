const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/company");

router.post("/", CompanyController.create);

router.post("/login", CompanyController.login);

router.patch("/:companyId", CompanyController.update);

router.get("/:companyId", CompanyController.getById);

router.get("/:companyId/products", CompanyController.getCompanyProducts);

router.get("/:companyId/shops", CompanyController.getCompanyShops);

module.exports = router;
