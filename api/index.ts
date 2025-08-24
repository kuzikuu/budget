import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Parse the URL to determine the endpoint
    const urlParts = url?.split('/').filter(Boolean) || [];
    
    if (urlParts[0] === 'api') {
      const endpoint = urlParts[1];
      const householdId = urlParts[2];

      switch (endpoint) {
        case 'categories':
          if (method === 'GET' && householdId) {
            const categories = await storage.getCategories(householdId);
            res.status(200).json(categories);
            return;
          }
          break;

        case 'budgets':
          if (method === 'GET' && householdId) {
            const budgets = await storage.getBudgets(householdId);
            res.status(200).json(budgets);
            return;
          } else if (method === 'POST') {
            const budgetData = req.body;
            const budget = await storage.createBudget({
              ...budgetData,
              householdId: budgetData.householdId || householdId
            });
            res.status(200).json(budget);
            return;
          }
          break;

        case 'expenses':
          if (method === 'GET' && householdId) {
            const expenses = await storage.getExpenses(householdId);
            res.status(200).json(expenses);
            return;
          } else if (method === 'POST') {
            const expenseData = req.body;
            const expense = await storage.createExpense({
              ...expenseData,
              householdId: expenseData.householdId || householdId
            });
            res.status(200).json(expense);
            return;
          }
          break;

        case 'dashboard':
          if (method === 'GET' && householdId) {
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
            return;
          }
          break;

        case 'crypto':
          if (method === 'GET' && householdId) {
            const holdings = await storage.getCryptoHoldings(householdId);
            res.status(200).json(holdings);
            return;
          }
          break;

        default:
          res.status(404).json({ message: 'Endpoint not found' });
          return;
      }
    }

    // If no API endpoint matched, return 404
    res.status(404).json({ message: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
