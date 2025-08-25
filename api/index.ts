// Simple API handler for Vercel serverless functions
export default async function handler(req: any, res: any) {
  try {
    const { method, url } = req;
    
    console.log(`${method} ${url}`);
    
    // Extract the path after /api
    const path = url.replace('/api', '');
    
    // Handle dashboard route
    if (path.startsWith('/dashboard/')) {
      if (method === 'GET') {
        const householdId = path.split('/dashboard/')[1];
        console.log('Dashboard request for household:', householdId);
        
        // Return mock data for now
        const mockData = {
          expenses: [
            { id: "exp1", description: "Grocery shopping", amount: "85.50", categoryId: "cat1", householdId, date: "2024-01-15" },
            { id: "exp2", description: "Gas station", amount: "45.00", categoryId: "cat2", householdId, date: "2024-01-14" }
          ],
          categories: [
            { id: "cat1", name: "Food & Dining", color: "#FF6B6B", householdId },
            { id: "cat2", name: "Transportation", color: "#4ECDC4", householdId },
            { id: "cat3", name: "Shopping", color: "#45B7D1", householdId },
            { id: "cat4", name: "Entertainment", color: "#96CEB4", householdId },
            { id: "cat5", name: "Health & Fitness", color: "#FFEAA7", householdId },
            { id: "cat6", name: "Housing", color: "#DDA0DD", householdId },
            { id: "cat7", name: "Utilities", color: "#98D8C8", householdId },
            { id: "cat8", name: "Insurance", color: "#F7DC6F", householdId },
            { id: "cat9", name: "Education", color: "#FFB6C1", householdId },
            { id: "cat10", name: "Travel", color: "#87CEEB", householdId },
            { id: "cat11", name: "Gifts", color: "#DDA0DD", householdId },
            { id: "cat12", name: "Miscellaneous", color: "#F0E68C", householdId }
          ],
          budgets: [
            { id: "budget1", categoryId: "cat1", amount: "800", period: "monthly", householdId },
            { id: "budget2", categoryId: "cat2", amount: "200", period: "monthly", householdId },
            { id: "budget3", categoryId: "cat3", amount: "400", period: "monthly", householdId },
            { id: "budget4", categoryId: "cat4", amount: "300", period: "monthly", householdId },
            { id: "budget5", categoryId: "cat5", amount: "400", period: "monthly", householdId },
            { id: "budget6", categoryId: "cat6", amount: "1100", period: "monthly", householdId },
            { id: "budget7", categoryId: "cat7", amount: "1000", period: "monthly", householdId },
            { id: "budget8", categoryId: "cat8", amount: "1000", period: "monthly", householdId }
          ]
        };
        
        return res.status(200).json(mockData);
      }
    }
    
    // Handle categories route
    if (path.startsWith('/categories/')) {
      if (method === 'GET') {
        const householdId = path.split('/categories/')[1];
        console.log('Categories request for household:', householdId);
        
        const categories = [
          { id: "cat1", name: "Food & Dining", color: "#FF6B6B", householdId },
          { id: "cat2", name: "Transportation", color: "#4ECDC4", householdId },
          { id: "cat3", name: "Shopping", color: "#45B7D1", householdId },
          { id: "cat4", name: "Entertainment", color: "#96CEB4", householdId },
          { id: "cat5", name: "Health & Fitness", color: "#FFEAA7", householdId },
          { id: "cat6", name: "Housing", color: "#DDA0DD", householdId },
          { id: "cat7", name: "Utilities", color: "#98D8C8", householdId },
          { id: "cat8", name: "Insurance", color: "#F7DC6F", householdId },
          { id: "cat9", name: "Education", color: "#FFB6C1", householdId },
          { id: "cat10", name: "Travel", color: "#87CEEB", householdId },
          { id: "cat11", name: "Gifts", color: "#DDA0DD", householdId },
          { id: "cat12", name: "Miscellaneous", color: "#F0E68C", householdId }
        ];
        
        return res.status(200).json(categories);
      } else if (method === 'POST') {
        // Handle creating new categories
        return res.status(201).json({ message: "Category created successfully" });
      }
    }
    
    // Handle budgets route
    if (path.startsWith('/budgets/')) {
      if (method === 'GET') {
        const householdId = path.split('/budgets/')[1];
        console.log('Budgets request for household:', householdId);
        
        const budgets = [
          { id: "budget1", categoryId: "cat1", amount: "800", period: "monthly", householdId },
          { id: "budget2", categoryId: "cat2", amount: "200", period: "monthly", householdId },
          { id: "budget3", categoryId: "cat3", amount: "400", period: "monthly", householdId },
          { id: "budget4", categoryId: "cat4", amount: "300", period: "monthly", householdId },
          { id: "budget5", categoryId: "cat5", amount: "400", period: "monthly", householdId },
          { id: "budget6", categoryId: "cat6", amount: "1100", period: "monthly", householdId },
          { id: "budget7", categoryId: "cat7", amount: "1000", period: "monthly", householdId },
          { id: "budget8", categoryId: "cat8", amount: "1000", period: "monthly", householdId }
        ];
        
        return res.status(200).json(budgets);
      } else if (method === 'POST') {
        // Handle creating new budgets
        return res.status(201).json({ message: "Budget created successfully" });
      }
    }
    
    // Handle budgets route without householdId (for POST requests)
    if (path === '/budgets') {
      if (method === 'POST') {
        console.log('Creating new budget:', req.body);
        return res.status(201).json({ message: "Budget created successfully" });
      }
    }
    
    // Handle categories route without householdId (for POST requests)
    if (path === '/categories') {
      if (method === 'POST') {
        console.log('Creating new category:', req.body);
        return res.status(201).json({ message: "Category created successfully" });
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
            symbol: "XRP",
            name: "Ripple",
            quantity: "1000",
            purchasePrice: "0.50",
            purchaseDate: "2023-01-15",
            householdId
          },
          {
            id: "crypto2",
            symbol: "TOBY",
            name: "Toby Token",
            quantity: "50000",
            purchasePrice: "0.001",
            purchaseDate: "2023-06-20",
            householdId
          }
        ];
        
        const cryptoData = cryptoHoldings.map(holding => ({
          ...holding,
          priceUsd: 0, // Placeholder
          usdValue: 0  // Placeholder
        }));
        
        return res.status(200).json({
          holdings: cryptoData,
          totalUsdValue: 0
        });
      }
    }
    
    // Handle expenses route
    if (path.startsWith('/expenses')) {
      if (method === 'GET') {
        const householdId = req.query.householdId || 'default-household';
        const expenses = [
          { id: "exp1", description: "Grocery shopping", amount: "85.50", categoryId: "cat1", householdId, date: "2024-01-15" },
          { id: "exp2", description: "Gas station", amount: "45.00", categoryId: "cat2", householdId, date: "2024-01-14" },
          { id: "exp3", description: "Movie tickets", amount: "32.00", categoryId: "cat4", householdId, date: "2024-01-13" },
          { id: "exp4", description: "Gym membership", amount: "50.00", categoryId: "cat5", householdId, date: "2024-01-12" }
        ];
        return res.status(200).json(expenses);
      } else if (method === 'POST') {
        // For now, just return success
        return res.status(201).json({ message: "Expense created successfully" });
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
