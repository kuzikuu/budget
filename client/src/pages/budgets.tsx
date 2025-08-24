import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBudgetSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const HOUSEHOLD_ID = "default-household";

const budgetFormSchema = insertBudgetSchema.extend({
  amount: z.string().min(1, "Amount is required"),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

export default function Budgets() {
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", HOUSEHOLD_ID],
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["/api/budgets", HOUSEHOLD_ID],
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", HOUSEHOLD_ID],
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const response = await apiRequest("POST", "/api/budgets", {
        ...data,
        householdId: HOUSEHOLD_ID,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets", HOUSEHOLD_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", HOUSEHOLD_ID] });
      setShowBudgetForm(false);
      form.reset();
    },
  });

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: "",
      amount: "",
      period: "monthly",
      householdId: HOUSEHOLD_ID,
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    createBudgetMutation.mutate(data);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || "Other";
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.icon || "fas fa-question";
  };

  const getBudgetProgress = (categoryId: string) => {
    const categoryProgress = dashboardData?.categoryProgress?.find((c: any) => c.id === categoryId);
    return categoryProgress || { spent: 0, budget: 0, percentage: 0, remaining: 0 };
  };

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Budget Management</h1>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            data-testid="button-add-budget"
          >
            <i className="fas fa-plus"></i>
            <span>Set Budget</span>
          </button>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category: any) => {
            const budget = budgets.find((b: any) => b.categoryId === category.id);
            const progress = getBudgetProgress(category.id);
            const hasValidBudget = budget && parseFloat(budget.amount) > 0;
            
            return (
              <div key={category.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" data-testid={`budget-card-${category.id}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className={`${category.icon} text-primary`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800" data-testid={`text-category-name-${category.id}`}>{category.name}</h3>
                      <div className="text-sm text-neutral">
                        {hasValidBudget ? `$${progress.spent.toFixed(2)} / $${progress.budget.toFixed(2)}` : "No budget set"}
                      </div>
                    </div>
                  </div>
                </div>

                {hasValidBudget ? (
                  <>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral">Progress</span>
                        <span className="font-medium" data-testid={`text-budget-percentage-${category.id}`}>
                          {progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress.percentage > 90 ? 'bg-red-500' : 
                            progress.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral">Remaining</span>
                      <span className={`font-medium ${progress.remaining < 0 ? 'text-red-500' : 'text-green-600'}`} data-testid={`text-budget-remaining-${category.id}`}>
                        ${Math.abs(progress.remaining).toFixed(2)} {progress.remaining < 0 ? 'over' : 'left'}
                      </span>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      form.setValue('categoryId', category.id);
                      setShowBudgetForm(true);
                    }}
                    className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-neutral hover:border-primary hover:text-primary transition-colors"
                    data-testid={`button-set-budget-${category.id}`}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Set Budget
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Budget Form Modal */}
        {showBudgetForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Set Budget</h3>
                <button 
                  onClick={() => setShowBudgetForm(false)}
                  className="text-neutral hover:text-slate-800"
                  data-testid="button-close-budget-form"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select 
                    {...form.register("categoryId")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    data-testid="select-budget-category"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {form.formState.errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-neutral">$</span>
                    <input 
                      {...form.register("amount")}
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      data-testid="input-budget-amount"
                    />
                  </div>
                  {form.formState.errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
                  <select 
                    {...form.register("period")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    data-testid="select-budget-period"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowBudgetForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-neutral rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid="button-cancel-budget"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createBudgetMutation.isPending}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    data-testid="button-save-budget"
                  >
                    {createBudgetMutation.isPending ? "Saving..." : "Save Budget"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
