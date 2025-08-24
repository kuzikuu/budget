import { useQuery } from "@tanstack/react-query";
import BudgetProgress from "@/components/budget-progress";
import ExpenseForm from "@/components/expense-form";
import ReceiptScanner from "@/components/receipt-scanner";
import CryptoPortfolio from "@/components/crypto-portfolio";
import { useState } from "react";

const HOUSEHOLD_ID = "default-household"; // In a real app, this would come from authentication

export default function Dashboard() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", HOUSEHOLD_ID],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const recentExpenses = dashboardData?.recentExpenses || [];
  const categoryProgress = dashboardData?.categoryProgress || [];

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Budget Overview Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral">Monthly Budget</span>
              <i className="fas fa-wallet text-primary"></i>
            </div>
            <div className="text-2xl font-semibold text-slate-800" data-testid="text-monthly-budget">
              ${summary.monthlyBudget?.toFixed(2) || "0.00"}
            </div>
            <div className="text-sm text-secondary mt-1">+2% from last month</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral">Spent This Month</span>
              <i className="fas fa-credit-card text-accent"></i>
            </div>
            <div className="text-2xl font-semibold text-slate-800" data-testid="text-spent-amount">
              ${summary.spent?.toFixed(2) || "0.00"}
            </div>
            <div className="text-sm text-accent mt-1">
              {summary.monthlyBudget > 0 ? Math.round((summary.spent / summary.monthlyBudget) * 100) : 0}% of budget
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral">Remaining</span>
              <i className="fas fa-piggy-bank text-secondary"></i>
            </div>
            <div className="text-2xl font-semibold text-secondary" data-testid="text-remaining-amount">
              ${summary.remaining?.toFixed(2) || "0.00"}
            </div>
            <div className="text-sm text-neutral mt-1">
              {summary.monthlyBudget > 0 ? Math.round((summary.remaining / summary.monthlyBudget) * 100) : 0}% remaining
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral">Avg. Daily Spend</span>
              <i className="fas fa-chart-line text-primary"></i>
            </div>
            <div className="text-2xl font-semibold text-slate-800" data-testid="text-daily-average">
              ${summary.dailyAverage?.toFixed(2) || "0.00"}
            </div>
            <div className="text-sm text-secondary mt-1">Under target</div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowExpenseForm(true)}
              className="flex flex-col items-center p-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="button-add-expense"
            >
              <i className="fas fa-plus text-xl mb-2"></i>
              <span className="text-sm font-medium">Add Expense</span>
            </button>
            
            <button 
              onClick={() => setShowReceiptScanner(true)}
              className="flex flex-col items-center p-4 bg-surface-variant text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              data-testid="button-scan-receipt"
            >
              <i className="fas fa-camera text-xl mb-2"></i>
              <span className="text-sm font-medium">Scan Receipt</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-surface-variant text-slate-700 rounded-lg hover:bg-slate-200 transition-colors" data-testid="button-set-budget">
              <i className="fas fa-chart-pie text-xl mb-2"></i>
              <span className="text-sm font-medium">Set Budget</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-surface-variant text-slate-700 rounded-lg hover:bg-slate-200 transition-colors" data-testid="button-export-data">
              <i className="fas fa-download text-xl mb-2"></i>
              <span className="text-sm font-medium">Export Data</span>
            </button>
          </div>
        </section>

        {/* Budget Progress by Category */}
        <BudgetProgress categories={categoryProgress} />

        {/* Crypto Portfolio */}
        <CryptoPortfolio />

        {/* Recent Expenses & Receipt Scanner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Expenses */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Recent Expenses</h2>
              <button className="text-primary text-sm font-medium hover:underline" data-testid="button-view-all-expenses">View All</button>
            </div>

            <div className="space-y-4">
              {recentExpenses.length === 0 ? (
                <div className="text-center py-8 text-neutral">
                  <i className="fas fa-receipt text-4xl mb-4 opacity-50"></i>
                  <p>No expenses yet. Add your first expense to get started!</p>
                </div>
              ) : (
                recentExpenses.slice(0, 5).map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between" data-testid={`expense-item-${expense.id}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-shopping-bag text-primary"></i>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800" data-testid={`text-expense-description-${expense.id}`}>{expense.description}</div>
                        <div className="text-sm text-neutral flex items-center space-x-2">
                          <span data-testid={`text-expense-date-${expense.id}`}>
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span data-testid={`text-expense-user-${expense.id}`}>Added by {expense.user?.username || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800" data-testid={`text-expense-amount-${expense.id}`}>
                        -${parseFloat(expense.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-neutral" data-testid={`text-expense-category-${expense.id}`}>
                        {expense.categoryId}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Receipt Scanner Preview */}
          <ReceiptScanner 
            isOpen={showReceiptScanner}
            onClose={() => setShowReceiptScanner(false)}
            onExpenseCreated={() => {
              setShowReceiptScanner(false);
              // Refresh dashboard data
              window.location.reload();
            }}
          />
        </div>

        {/* Expense Form Modal */}
        <ExpenseForm 
          isOpen={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          onExpenseCreated={() => {
            setShowExpenseForm(false);
            // Refresh dashboard data
            window.location.reload();
          }}
        />

      </main>
    </div>
  );
}
