interface CategoryProgress {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  budget: number;
  remaining: number;
  percentage: number;
}

interface BudgetProgressProps {
  categories: CategoryProgress[];
}

export default function BudgetProgress({ categories }: BudgetProgressProps) {
  if (categories.length === 0) {
    return (
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Budget Progress by Category</h2>
        <div className="text-center py-8 text-neutral">
          <i className="fas fa-chart-pie text-4xl mb-4 opacity-50"></i>
          <p>No budget categories set up yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Budget Progress by Category</h2>
        <select className="text-sm text-neutral border border-gray-200 rounded-lg px-3 py-2" data-testid="select-budget-timeframe">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
        </select>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} data-testid={`category-progress-${category.id}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className={`${category.icon} text-primary`}></i>
                </div>
                <div>
                  <div className="font-medium text-slate-800" data-testid={`text-category-name-${category.id}`}>
                    {category.name}
                  </div>
                  <div className="text-sm text-neutral" data-testid={`text-category-spending-${category.id}`}>
                    ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-800" data-testid={`text-category-percentage-${category.id}`}>
                  {category.percentage}%
                </div>
                <div className={`text-xs ${category.remaining < 0 ? 'text-accent' : 'text-secondary'}`} data-testid={`text-category-remaining-${category.id}`}>
                  {category.remaining < 0 ? `$${Math.abs(category.remaining).toFixed(2)} over` : `$${category.remaining.toFixed(2)} left`}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  category.percentage > 100 ? 'bg-accent' :
                  category.percentage > 90 ? 'bg-yellow-500' :
                  category.percentage > 75 ? 'bg-orange-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(category.percentage, 100)}%` }}
                data-testid={`progress-bar-${category.id}`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
