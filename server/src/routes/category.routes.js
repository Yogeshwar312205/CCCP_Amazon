const express = require('express');
const CategoryController = require('../controllers/category.controller');

const router = express.Router();

router.get('/', CategoryController.getCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);

module.exports = router;
