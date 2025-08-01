const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all expenses for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, startDate, endDate } = req.query;
    
    const query = { userId: req.user._id };
    
    // Add category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error while fetching expenses' });
  }
});

// Create new expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;

    // Validation
    if (!amount || !description || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const validCategories = ['food', 'transport', 'shopping', 'entertainment', 'health', 'bills', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const expense = new Expense({
      userId: req.user._id,
      amount,
      description: description.trim(),
      category,
      date: date ? new Date(date) : new Date(),
    });

    await expense.save();

    res.status(201).json({
      message: 'Expense created successfully',
      expense,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error while creating expense' });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;
    
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Validation
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const validCategories = ['food', 'transport', 'shopping', 'entertainment', 'health', 'bills', 'other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Update fields
    if (amount !== undefined) expense.amount = amount;
    if (description !== undefined) expense.description = description.trim();
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);

    await expense.save();

    res.json({
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error while updating expense' });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error while deleting expense' });
  }
});

// Get expense analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get expenses by category
    const categoryTotals = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    // Get monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get today's total
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTotal = await Expense.aggregate([
      { 
        $match: { 
          userId,
          date: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get this month's total
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyTotal = await Expense.aggregate([
      { 
        $match: { 
          userId,
          date: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalExpenses: totalExpenses[0]?.total || 0,
      todayTotal: todayTotal[0]?.total || 0,
      monthlyTotal: monthlyTotal[0]?.total || 0,
      categoryTotals: categoryTotals.reduce((acc, item) => {
        acc[item._id] = item.total;
        return acc;
      }, {}),
      monthlyExpenses: monthlyExpenses.reduce((acc, item) => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        acc[key] = item.total;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

module.exports = router;