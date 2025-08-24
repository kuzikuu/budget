import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertExpenseSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const HOUSEHOLD_ID = "default-household";
const USER_ID = "user1"; // In a real app, this would come from authentication

const expenseFormSchema = insertExpenseSchema.extend({
  amount: z.string().min(1, "Amount is required"),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
  initialData?: Partial<ExpenseFormData>;
}

export default function ExpenseForm({ isOpen, onClose, onExpenseCreated, initialData }: ExpenseFormProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", HOUSEHOLD_ID],
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: initialData?.amount || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      userId: USER_ID,
      householdId: HOUSEHOLD_ID,
      isShared: initialData?.isShared || false,
      date: initialData?.date || new Date(),
      receiptImage: initialData?.receiptImage || null,
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const response = await apiRequest("POST", "/api/expenses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", HOUSEHOLD_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", HOUSEHOLD_ID] });
      onExpenseCreated();
      form.reset();
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    createExpenseMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Add New Expense</h3>
          <button 
            onClick={onClose}
            className="text-neutral hover:text-slate-800"
            data-testid="button-close-expense-form"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-neutral">$</span>
              <input 
                {...form.register("amount")}
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                data-testid="input-expense-amount"
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <input 
              {...form.register("description")}
              type="text" 
              placeholder="e.g., Grocery shopping at Whole Foods" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              data-testid="input-expense-description"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select 
              {...form.register("categoryId")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              data-testid="select-expense-category"
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {form.formState.errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input 
              {...form.register("date", { 
                setValueAs: (value) => value ? new Date(value) : new Date() 
              })}
              type="date" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              data-testid="input-expense-date"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input 
              {...form.register("isShared")}
              type="checkbox" 
              id="shared" 
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              data-testid="checkbox-expense-shared"
            />
            <label htmlFor="shared" className="text-sm text-slate-700">Shared expense</label>
          </div>

          <div className="flex space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-neutral rounded-lg hover:bg-gray-50 transition-colors"
              data-testid="button-cancel-expense"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createExpenseMutation.isPending}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              data-testid="button-save-expense"
            >
              {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
