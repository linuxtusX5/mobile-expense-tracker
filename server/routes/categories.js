const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// Initialize default categories
router.post('/init', async (req, res) => {
  try {
    const defaultCategories = [
      { id: "food", name: "Food", color: "#EF4444" },
      { id: "transport", name: "Transport", color: "#3B82F6" },
      { id: "shopping", name: "Shopping", color: "#10B981" },
      { id: "entertainment", name: "Entertainment", color: "#8B5CF6" },
      { id: "health", name: "Health", color: "#F59E0B" },
      { id: "bills", name: "Bills", color: "#06B6D4" },
      { id: "other", name: "Other", color: "#6B7280" },
    ];

    // Check if categories already exist
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      return res.json({ message: 'Categories already initialized', categories: existingCategories });
    }

    // Create default categories
    const categories = await Category.insertMany(defaultCategories);
    res.status(201).json({ message: 'Categories initialized successfully', categories });
  } catch (error) {
    console.error('Initialize categories error:', error);
    res.status(500).json({ message: 'Server error while initializing categories' });
  }
});

module.exports = router;