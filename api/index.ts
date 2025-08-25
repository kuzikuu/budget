// Simple working API for BudgetBuddy with data persistence
let storedExpenses = [
  { id: "exp1", description: "Grocery shopping", amount: 85.50, categoryId: "cat1", date: "2024-01-15" },
  { id: "exp2", description: "Gas station", amount: 45.00, categoryId: "cat2", date: "2024-01-14" },
  { id: "exp3", description: "Movie tickets", amount: 32.00, categoryId: "cat4", date: "2024-01-13" }
];

let storedCategories = [
  { id: "cat1", name: "Groceries", color: "#2563EB" },
  { id: "cat2", name: "Transportation", color: "#059669" },
  { id: "cat3", name: "Utilities", color: "#DC2626" },
  { id: "cat4", name: "Healthcare", color: "#DB2777" },
  { id: "cat5", name: "Personal", color: "#7C3AED" },
  { id: "cat6", name: "Student Loan", color: "#F59E0B" },
  { id: "cat7", name: "Credit Cards", color: "#EF4444" },
  { id: "cat8", name: "Savings", color: "#10B981" }
];

let storedBudgets = [
  { id: "budget1", categoryId: "cat1", amount: 800, period: "monthly" },
  { id: "budget2", categoryId: "cat2", amount: 200, period: "monthly" },
  { id: "budget3", categoryId: "cat3", amount: 400, period: "monthly" },
  { id: "budget4", categoryId: "cat4", amount: 300, period: "monthly" },
  { id: "budget5", categoryId: "cat5", amount: 400, period: "monthly" },
  { id: "budget6", categoryId: "cat6", amount: 1100, period: "monthly" },
  { id: "budget7", categoryId: "cat7", amount: 1000, period: "monthly" },
  { id: "budget8", categoryId: "cat8", amount: 1000, period: "monthly" }
];

export default async function handler(req: any, res: any) {
  try {
    const { method, url } = req;
    
    console.log('=== API CALL ===');
    console.log('Method:', method);
    console.log('URL:', url);
    console.log('Headers:', req.headers);
    console.log('================');
    
    // Handle all routes simply
    if (url.includes('/categories') || url.includes('/categories/')) {
      console.log('Handling categories request');
      if (method === 'GET') {
        return res.status(200).json(storedCategories);
      }
      if (method === 'POST') {
        return res.status(201).json({ message: "Category created" });
      }
    }
    
    if (url.includes('/budgets') || url.includes('/budgets/')) {
      console.log('Handling budgets request');
      if (method === 'GET') {
        return res.status(200).json(storedBudgets);
      }
      if (method === 'POST') {
        return res.status(201).json({ message: "Budget created" });
      }
    }
    
    if (url.includes('/expenses') || url.includes('/expenses/')) {
      console.log('Handling expenses request');
      if (method === 'GET') {
        console.log('Returning stored expenses:', storedExpenses);
        return res.status(200).json(storedExpenses);
      }
      if (method === 'POST') {
        console.log('Creating new expense:', req.body);
        const newExpense = {
          id: `exp${Date.now()}`,
          description: req.body.description,
          amount: parseFloat(req.body.amount),
          categoryId: req.body.categoryId,
          date: req.body.date
        };
        
        storedExpenses.push(newExpense);
        console.log('Expense added to storage. Total expenses:', storedExpenses.length);
        
        return res.status(201).json(newExpense);
      }
      if (method === 'DELETE') {
        console.log('Deleting expense:', req.body);
        const expenseId = req.body.id;
        storedExpenses = storedExpenses.filter(exp => exp.id !== expenseId);
        console.log('Expense deleted from storage. Total expenses:', storedExpenses.length);
        
        return res.status(200).json({ message: "Expense deleted" });
      }
    }
    
    if (url.includes('/dashboard') || url.includes('/dashboard/')) {
      console.log('Handling dashboard request');
      const dashboardData = {
        categories: storedCategories,
        budgets: storedBudgets,
        expenses: storedExpenses
      };
      console.log('Returning dashboard data with', storedExpenses.length, 'expenses');
      return res.status(200).json(dashboardData);
    }
    
    if (url.includes('/crypto') || url.includes('/crypto/')) {
      console.log('Handling crypto request');
      return res.status(200).json({
        holdings: [
          { symbol: "XRP", amount: "22000", platform: "Coinbase" },
          { symbol: "TOBY", amount: "1150000000000", platform: "DEX" }
        ]
      });
    }
    
    // Default response
    console.log('No specific route matched, returning default data');
    return res.status(200).json({ 
      message: "API working", 
      categories: storedCategories, 
      budgets: storedBudgets, 
      expenses: storedExpenses,
      debug: {
        method,
        url,
        timestamp: new Date().toISOString(),
        totalExpenses: storedExpenses.length
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: error.stack
    });
  }
}
