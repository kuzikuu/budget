import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ExpenseForm from "@/components/expense-form";

const HOUSEHOLD_ID = "default-household";

export default function Expenses() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["/api/expenses", HOUSEHOLD_ID],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", HOUSEHOLD_ID],
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || "Other";
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.icon || "fas fa-question";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface pb-20 md:pb-0">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Expenses</h1>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            data-testid="button-add-expense"
          >
            <i className="fas fa-plus"></i>
            <span>Add Expense</span>
          </button>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-receipt text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No expenses yet</h3>
              <p className="text-neutral mb-6">Start tracking your expenses by adding your first one!</p>
              <button
                onClick={() => setShowExpenseForm(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                data-testid="button-add-first-expense"
              >
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {expenses.map((expense: any) => (
                <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors" data-testid={`expense-row-${expense.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className={`${getCategoryIcon(expense.categoryId)} text-primary`}></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800" data-testid={`text-expense-description-${expense.id}`}>
                          {expense.description}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-neutral mt-1">
                          <span data-testid={`text-expense-category-${expense.id}`}>
                            {getCategoryName(expense.categoryId)}
                          </span>
                          <span>•</span>
                          <span data-testid={`text-expense-date-${expense.id}`}>
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span data-testid={`text-expense-user-${expense.id}`}>
                            {expense.user?.username || 'Unknown'}
                          </span>
                          {expense.isShared && (
                            <>
                              <span>•</span>
                              <span className="text-secondary font-medium">Shared</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-800" data-testid={`text-expense-amount-${expense.id}`}>
                        ${parseFloat(expense.amount).toFixed(2)}
                      </div>
                      {expense.receiptImage && (
                        <div className="text-xs text-primary mt-1 flex items-center">
                          <i className="fas fa-paperclip mr-1"></i>
                          Receipt attached
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Form Modal */}
        <ExpenseForm 
          isOpen={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          onExpenseCreated={() => {
            setShowExpenseForm(false);
            window.location.reload();
          }}
        />

      </main>
    </div>
  );
}
