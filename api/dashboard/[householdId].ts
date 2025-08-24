import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { householdId } = req.query;
    
    if (!householdId || typeof householdId !== 'string') {
      res.status(400).json({ message: 'Household ID is required' });
      return;
    }

    const expenses = await storage.getExpenses(householdId);
    const budgets = await storage.getBudgets(householdId);
    const categories = await storage.getCategories(householdId);
    const members = await storage.getHouseholdMembers(householdId);

    // Calculate current month expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyExpenses = await storage.getExpensesByDateRange(householdId, startOfMonth, now);
    
    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const remaining = totalBudget - totalSpent;
    const dailyAverage = totalSpent / now.getDate();

    // Calculate category progress
    const categoryProgress = categories.map(category => {
      const categoryBudget = budgets.find(b => b.categoryId === category.id);
      const categoryExpenses = monthlyExpenses.filter(e => e.categoryId === category.id);
      const spent = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const budgetAmount = categoryBudget ? parseFloat(categoryBudget.amount) : 0;
      const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

      return {
        ...category,
        spent,
        budget: budgetAmount,
        remaining: budgetAmount - spent,
        percentage,
      };
    });

    res.status(200).json({
      summary: {
        monthlyBudget: totalBudget,
        spent: totalSpent,
        remaining,
        dailyAverage,
      },
      categoryProgress,
      recentExpenses: expenses.slice(0, 10),
      members,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
