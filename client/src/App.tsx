import React, { useState, useEffect } from 'react';
import './App.css';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: string;
}

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('🔌 Fetching data from Redis API...');
      const response = await fetch('/api/dashboard');
      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Data received:', data);

      setCategories(data.categories || []);
      setBudgets(data.budgets || []);
      setExpenses(data.expenses || []);
      setIsUsingFallback(false);

    } catch (error) {
      console.error('❌ Failed to load data from API:', error);
      console.log('⚠️ Using fallback data...');

      // Fallback data if API fails
      setCategories([
        { id: "cat1", name: "Groceries", color: "#2563EB" },
        { id: "cat2", name: "Transportation", color: "#059669" },
        { id: "cat3", name: "Utilities", color: "#DC2626" },
        { id: "cat4", name: "Healthcare", color: "#DB2777" },
        { id: "cat5", name: "Personal", color: "#7C3AED" },
        { id: "cat6", name: "Student Loan", color: "#F59E0B" },
        { id: "cat7", name: "Credit Cards", color: "#EF4444" },
        { id: "cat8", name: "Savings", color: "#10B981" }
      ]);
      setBudgets([
        { id: "budget1", categoryId: "cat1", amount: 800, period: "monthly" },
        { id: "budget2", categoryId: "cat2", amount: 200, period: "monthly" },
        { id: "budget3", categoryId: "cat3", amount: 400, period: "monthly" },
        { id: "budget4", categoryId: "cat4", amount: 300, period: "monthly" },
        { id: "budget5", categoryId: "cat5", amount: 400, period: "monthly" },
        { id: "budget6", categoryId: "cat6", amount: 1100, period: "monthly" },
        { id: "budget7", categoryId: "cat7", amount: 1000, period: "monthly" },
        { id: "budget8", categoryId: "cat8", amount: 1000, period: "monthly" }
      ]);
      setExpenses([
        { id: "exp1", description: "Grocery shopping", amount: 85.50, categoryId: "cat1", date: "2024-01-15" },
        { id: "exp2", description: "Gas station", amount: 45.00, categoryId: "cat2", date: "2024-01-14" },
        { id: "exp3", description: "Movie tickets", amount: 32.00, categoryId: "cat4", date: "2024-01-13" }
      ]);
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.categoryId) {
      alert('Please fill in all fields');
      return;
    }

    const expense: Expense = {
      id: `exp${Date.now()}`,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      categoryId: newExpense.categoryId,
      date: newExpense.date
    };

    try {
      console.log('💾 Saving expense to Redis...');
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });

      if (response.ok) {
        console.log('✅ Expense saved to Redis successfully');
        // Reload data to get the latest from Redis
        await loadDashboardData();
      } else {
        console.log('❌ API failed, adding locally');
        setExpenses([...expenses, expense]);
      }

      setNewExpense({
        description: '',
        amount: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('❌ Failed to add expense:', error);
      // Add locally if API fails
      setExpenses([...expenses, expense]);
      setNewExpense({
        description: '',
        amount: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      console.log('🗑️ Deleting expense from Redis...');
      const response = await fetch('/api/expenses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        console.log('✅ Expense deleted from Redis successfully');
        // Reload data to get the latest from Redis
        await loadDashboardData();
      } else {
        console.log('❌ API failed, deleting locally');
        setExpenses(expenses.filter(exp => exp.id !== id));
      }
    } catch (error) {
      console.error('❌ Failed to delete expense:', error);
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#666';
  };

  const getBudgetAmount = (categoryId: string) => {
    return budgets.find(budget => budget.categoryId === categoryId)?.amount || 0;
  };

  const getTotalSpent = (categoryId: string) => {
    return expenses
      .filter(exp => exp.categoryId === categoryId)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getRemainingBudget = (categoryId: string) => {
    const budget = getBudgetAmount(categoryId);
    const spent = getTotalSpent(categoryId);
    return budget - spent;
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRemaining = totalBudget - totalSpent;

  if (isLoading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>🔄 Loading Budget Tracker...</h2>
          <p>Connecting to Redis database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <h1>💰 Budget Tracker</h1>
        <p>Track your monthly expenses against your budget</p>
        {isUsingFallback ? (
          <div className="fallback-warning">
            ⚠️ Using offline data - Redis connection failed
          </div>
        ) : (
          <div className="storage-info">
            💾 Data synced across all your devices via Redis
          </div>
        )}
      </header>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Budget</h3>
          <p className="amount">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Spent</h3>
          <p className="amount spent">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Remaining</h3>
          <p className={`amount ${totalRemaining >= 0 ? 'remaining' : 'over-budget'}`}>
            ${totalRemaining.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="main-content">
        <div className="budget-overview">
          <h2>Budget Overview</h2>
          <div className="budget-grid">
            {budgets.map(budget => {
              const category = categories.find(cat => cat.id === budget.categoryId);
              const spent = getTotalSpent(budget.categoryId);
              const remaining = budget.amount - spent;
              const percentage = (spent / budget.amount) * 100;
              
              return (
                <div key={budget.id} className="budget-item">
                  <div className="budget-header">
                    <h4 style={{ color: category?.color }}>{category?.name}</h4>
                    <span className="budget-amount">${budget.amount.toLocaleString()}</span>
                  </div>
                  <div className="budget-progress">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: percentage > 100 ? '#ef4444' : category?.color
                      }}
                    ></div>
                  </div>
                  <div className="budget-stats">
                    <span>Spent: ${spent.toLocaleString()}</span>
                    <span className={remaining >= 0 ? 'remaining' : 'over-budget'}>
                      {remaining >= 0 ? 'Left: ' : 'Over: '}${Math.abs(remaining).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="expense-section">
          <h2>Add New Expense</h2>
          <form onSubmit={addExpense} className="expense-form">
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              required
            />
            <select
              value={newExpense.categoryId}
              onChange={(e) => setNewExpense({...newExpense, categoryId: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
              required
            />
            <button type="submit">Add Expense</button>
          </form>

          <h2>Recent Expenses</h2>
          <div className="expenses-list">
            {expenses.map(expense => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <h4>{expense.description}</h4>
                  <span className="expense-category" style={{ color: getCategoryColor(expense.categoryId) }}>
                    {getCategoryName(expense.categoryId)}
                  </span>
                  <span className="expense-date">{expense.date}</span>
                </div>
                <div className="expense-amount">
                  <span>${expense.amount.toLocaleString()}</span>
                  <button 
                    onClick={() => deleteExpense(expense.id)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
