import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/dashboard")) return true;
    return location === path;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-coins text-white text-sm"></i>
              </div>
              <span className="text-xl font-semibold text-slate-800">BudgetTogether</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard">
                <a className={`${isActive("/dashboard") || isActive("/") ? "text-primary font-medium border-b-2 border-primary pb-4" : "text-neutral hover:text-slate-800 transition-colors"}`} data-testid="link-dashboard">
                  Dashboard
                </a>
              </Link>
              <Link href="/expenses">
                <a className={`${isActive("/expenses") ? "text-primary font-medium border-b-2 border-primary pb-4" : "text-neutral hover:text-slate-800 transition-colors"}`} data-testid="link-expenses">
                  Expenses
                </a>
              </Link>
              <Link href="/budgets">
                <a className={`${isActive("/budgets") ? "text-primary font-medium border-b-2 border-primary pb-4" : "text-neutral hover:text-slate-800 transition-colors"}`} data-testid="link-budgets">
                  Budgets
                </a>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-surface-variant px-3 py-2 rounded-lg">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" alt="User 1" className="w-8 h-8 rounded-full border-2 border-white" data-testid="img-avatar-1" />
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="User 2" className="w-8 h-8 rounded-full border-2 border-white" data-testid="img-avatar-2" />
                </div>
                <span className="text-sm text-neutral" data-testid="text-household-name">The Johnsons</span>
              </div>
              <button className="md:hidden text-neutral" data-testid="button-mobile-menu">
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          <Link href="/dashboard">
            <button className={`flex flex-col items-center space-y-1 p-2 ${isActive("/dashboard") || isActive("/") ? "text-primary" : "text-neutral"}`} data-testid="button-mobile-home">
              <i className="fas fa-home text-lg"></i>
              <span className="text-xs font-medium">Home</span>
            </button>
          </Link>
          <Link href="/expenses">
            <button className={`flex flex-col items-center space-y-1 p-2 ${isActive("/expenses") ? "text-primary" : "text-neutral"}`} data-testid="button-mobile-expenses">
              <i className="fas fa-receipt text-lg"></i>
              <span className="text-xs">Expenses</span>
            </button>
          </Link>
          <button className="flex flex-col items-center space-y-1 p-2 bg-primary text-white rounded-full w-12 h-12 -mt-4 shadow-lg" data-testid="button-mobile-add">
            <i className="fas fa-plus text-lg"></i>
          </button>
          <Link href="/budgets">
            <button className={`flex flex-col items-center space-y-1 p-2 ${isActive("/budgets") ? "text-primary" : "text-neutral"}`} data-testid="button-mobile-budgets">
              <i className="fas fa-chart-pie text-lg"></i>
              <span className="text-xs">Budgets</span>
            </button>
          </Link>
          <button className="flex flex-col items-center space-y-1 p-2 text-neutral" data-testid="button-mobile-profile">
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
