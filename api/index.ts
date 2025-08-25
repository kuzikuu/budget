// Simple API handler for Vercel serverless functions
export default async function handler(req: any, res: any) {
  try {
    const { method, url } = req;
    
    console.log(`${method} ${url}`);
    
    // Extract the path after /api (if it exists)
    let path = url;
    if (url.startsWith('/api')) {
      path = url.replace('/api', '');
    }
    
    // Handle dashboard route
    if (path.startsWith('/dashboard/')) {
      if (method === 'GET') {
        const householdId = path.split('/dashboard/')[1];
        console.log('Dashboard request for household:', householdId);
        
        // Return comprehensive mock data matching storage.ts structure
        const mockData = {
          expenses: [
            { id: "exp1", description: "Grocery shopping", amount: "85.50", categoryId: "cat1", householdId, date: "2024-01-15" },
            { id: "exp2", description: "Gas station", amount: "45.00", categoryId: "cat2", householdId, date: "2024-01-14" },
            { id: "exp3", description: "Movie tickets", amount: "32.00", categoryId: "cat4", householdId, date: "2024-01-13" },
            { id: "exp4", description: "Gym membership", amount: "50.00", categoryId: "cat5", householdId, date: "2024-01-12" },
            { id: "exp5", description: "Restaurant dinner", amount: "65.00", categoryId: "cat1", householdId, date: "2024-01-11" },
            { id: "exp6", description: "Uber ride", amount: "25.00", categoryId: "cat2", householdId, date: "2024-01-10" }
          ],
          categories: [
            { id: "cat1", name: "Groceries", icon: "fas fa-shopping-cart", color: "#2563EB", householdId },
            { id: "cat2", name: "Transportation/Maintenance", icon: "fas fa-car", color: "#059669", householdId },
            { id: "cat3", name: "Utilities", icon: "fas fa-bolt", color: "#DC2626", householdId },
            { id: "cat4", name: "Healthcare", icon: "fas fa-heartbeat", color: "#DB2777", householdId },
            { id: "cat5", name: "Personal Expenses", icon: "fas fa-user", color: "#7C3AED", householdId },
            { id: "cat6", name: "Student Loan", icon: "fas fa-graduation-cap", color: "#F59E0B", householdId },
            { id: "cat7", name: "Credit Card Payments", icon: "fas fa-credit-card", color: "#EF4444", householdId },
            { id: "cat8", name: "Savings for House", icon: "fas fa-home", color: "#10B981", householdId },
            { id: "cat9", name: "Buffer/Emergency", icon: "fas fa-shield-alt", color: "#6B7280", householdId },
            { id: "cat10", name: "Pilates", icon: "fas fa-dumbbell", color: "#8B5CF6", householdId },
            { id: "cat11", name: "Mattress", icon: "fas fa-bed", color: "#EC4899", householdId },
            { id: "cat12", name: "Clothing and Household Items", icon: "fas fa-tshirt", color: "#F97316", householdId }
          ],
          budgets: [
            { id: "budget1", categoryId: "cat1", amount: "800", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget2", categoryId: "cat2", amount: "200", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget3", categoryId: "cat3", amount: "400", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget4", categoryId: "cat4", amount: "300", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget5", categoryId: "cat5", amount: "400", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget6", categoryId: "cat6", amount: "1100", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget7", categoryId: "cat7", amount: "1000", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget8", categoryId: "cat8", amount: "1000", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget9", categoryId: "cat9", amount: "400", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget10", categoryId: "cat10", amount: "225", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget11", categoryId: "cat11", amount: "500", period: "monthly", householdId, createdAt: new Date() },
            { id: "budget12", categoryId: "cat12", amount: "200", period: "monthly", householdId, createdAt: new Date() }
          ]
        };
        
        return res.status(200).json(mockData);
      }
    }
    
    // Handle categories route (with and without /api)
    if (path.startsWith('/categories/') || path.startsWith('/categories')) {
      if (method === 'GET') {
        let householdId = 'default-household';
        if (path.includes('/')) {
          householdId = path.split('/categories/')[1] || 'default-household';
        }
        console.log('Categories request for household:', householdId);
        
        const categories = [
          { id: "cat1", name: "Groceries", icon: "fas fa-shopping-cart", color: "#2563EB", householdId },
          { id: "cat2", name: "Transportation/Maintenance", icon: "fas fa-car", color: "#059669", householdId },
          { id: "cat3", name: "Utilities", icon: "fas fa-bolt", color: "#DC2626", householdId },
          { id: "cat4", name: "Healthcare", icon: "fas fa-heartbeat", color: "#DB2777", householdId },
          { id: "cat5", name: "Personal Expenses", icon: "fas fa-user", color: "#7C3AED", householdId },
          { id: "cat6", name: "Student Loan", icon: "fas fa-graduation-cap", color: "#F59E0B", householdId },
          { id: "cat7", name: "Credit Card Payments", icon: "fas fa-credit-card", color: "#EF4444", householdId },
          { id: "cat8", name: "Savings for House", icon: "fas fa-home", color: "#10B981", householdId },
          { id: "cat9", name: "Buffer/Emergency", icon: "fas fa-shield-alt", color: "#6B7280", householdId },
          { id: "cat10", name: "Pilates", icon: "fas fa-dumbbell", color: "#8B5CF6", householdId },
          { id: "cat11", name: "Mattress", icon: "fas fa-bed", color: "#EC4899", householdId },
          { id: "cat12", name: "Clothing and Household Items", icon: "fas fa-tshirt", color: "#F97316", householdId }
        ];
        
        return res.status(200).json(categories);
      } else if (method === 'POST') {
        console.log('Creating new category:', req.body);
        return res.status(201).json({ message: "Category created successfully" });
      }
    }
    
    // Handle budgets route (with and without /api)
    if (path.startsWith('/budgets/') || path.startsWith('/budgets')) {
      if (method === 'GET') {
        let householdId = 'default-household';
        if (path.includes('/')) {
          householdId = path.split('/budgets/')[1] || 'default-household';
        }
        console.log('Budgets request for household:', householdId);
        
        const budgets = [
          { id: "budget1", categoryId: "cat1", amount: "800", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget2", categoryId: "cat2", amount: "200", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget3", categoryId: "cat3", amount: "400", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget4", categoryId: "cat4", amount: "300", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget5", categoryId: "cat5", amount: "400", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget6", categoryId: "cat6", amount: "1100", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget7", categoryId: "cat7", amount: "1000", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget8", categoryId: "cat8", amount: "1000", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget9", categoryId: "cat9", amount: "400", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget10", categoryId: "cat10", amount: "225", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget11", categoryId: "cat11", amount: "500", period: "monthly", householdId, createdAt: new Date() },
          { id: "budget12", categoryId: "cat12", amount: "200", period: "monthly", householdId, createdAt: new Date() }
        ];
        
        return res.status(200).json(budgets);
      } else if (method === 'POST') {
        console.log('Creating new budget:', req.body);
        // Generate a new ID for the budget
        const newBudget = {
          id: `budget${Date.now()}`,
          ...req.body,
          createdAt: new Date(),
          householdId: req.body.householdId || 'default-household'
        };
        return res.status(201).json(newBudget);
      }
    }
    
    // Handle crypto route
    if (path.startsWith('/crypto/')) {
      if (method === 'GET') {
        const householdId = path.split('/crypto/')[1];
        console.log('Crypto request for household:', householdId);
        
        const cryptoHoldings = [
          {
            id: "crypto1",
            householdId,
            symbol: "XRP",
            name: "XRP",
            amount: "22000",
            platform: "Coinbase",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "crypto2",
            householdId,
            symbol: "TOBY",
            name: "$TOBY",
            amount: "1150000000000",
            platform: "DEX",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        return res.status(200).json(cryptoHoldings);
      }
    }
    
    // Handle expenses route (with and without /api)
    if (path.startsWith('/expenses')) {
      if (method === 'GET') {
        const householdId = req.query.householdId || 'default-household';
        const expenses = [
          { id: "exp1", description: "Grocery shopping", amount: "85.50", categoryId: "cat1", householdId, date: "2024-01-15" },
          { id: "exp2", description: "Gas station", amount: "45.00", categoryId: "cat2", householdId, date: "2024-01-14" },
          { id: "exp3", description: "Movie tickets", amount: "32.00", categoryId: "cat4", householdId, date: "2024-01-13" },
          { id: "exp4", description: "Gym membership", amount: "50.00", categoryId: "cat5", householdId, date: "2024-01-12" },
          { id: "exp5", description: "Restaurant dinner", amount: "65.00", categoryId: "cat1", householdId, date: "2024-01-11" },
          { id: "exp6", description: "Uber ride", amount: "25.00", categoryId: "cat2", householdId, date: "2024-01-10" }
        ];
        return res.status(200).json(expenses);
      } else if (method === 'POST') {
        console.log('Creating new expense:', req.body);
        // Generate a new ID for the expense
        const newExpense = {
          id: `exp${Date.now()}`,
          ...req.body,
          date: req.body.date || new Date().toISOString().split('T')[0]
        };
        return res.status(201).json(newExpense);
      } else if (method === 'DELETE') {
        console.log('Deleting expense:', req.body);
        return res.status(200).json({ message: "Expense deleted successfully" });
      }
    }
    
    // Default response for unknown routes
    console.log('Route not found:', path);
    return res.status(404).json({ message: 'Route not found', path });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
