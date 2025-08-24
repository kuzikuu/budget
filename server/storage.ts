import { type User, type InsertUser, type Household, type InsertHousehold, type Category, type InsertCategory, type Budget, type InsertBudget, type Expense, type InsertExpense, type Receipt, type InsertReceipt, type CryptoHolding, type InsertCryptoHolding } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Households
  getHousehold(id: string): Promise<Household | undefined>;
  createHousehold(household: InsertHousehold): Promise<Household>;
  getHouseholdMembers(householdId: string): Promise<User[]>;

  // Categories
  getCategories(householdId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getDefaultCategories(): Category[];

  // Budgets
  getBudgets(householdId: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;

  // Expenses
  getExpenses(householdId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByCategory(householdId: string, categoryId: string): Promise<Expense[]>;
  getExpensesByDateRange(householdId: string, startDate: Date, endDate: Date): Promise<Expense[]>;

  // Receipts
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceiptsByExpense(expenseId: string): Promise<Receipt[]>;

  // Crypto Holdings
  getCryptoHoldings(householdId: string): Promise<CryptoHolding[]>;
  createCryptoHolding(holding: InsertCryptoHolding): Promise<CryptoHolding>;
  updateCryptoHolding(id: string, holding: Partial<InsertCryptoHolding>): Promise<CryptoHolding | undefined>;
  deleteCryptoHolding(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private households: Map<string, Household> = new Map();
  private categories: Map<string, Category> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private receipts: Map<string, Receipt> = new Map();
  private cryptoHoldings: Map<string, CryptoHolding> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Create default household
    const defaultHousehold: Household = {
      id: "default-household",
      name: "The Johnsons",
      createdAt: new Date(),
    };
    this.households.set(defaultHousehold.id, defaultHousehold);

    // Create default users
    const user1: User = {
      id: "user1",
      username: "sarah",
      password: "password",
      householdId: defaultHousehold.id,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    };
    
    const user2: User = {
      id: "user2",
      username: "mike",
      password: "password",
      householdId: defaultHousehold.id,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);

    // Create default categories
    const defaultCategories = this.getDefaultCategories();
    defaultCategories.forEach(category => {
      const categoryWithHousehold = { ...category, householdId: defaultHousehold.id };
      this.categories.set(category.id, categoryWithHousehold);
    });

    // Create default budgets based on user's actual budget
    const defaultBudgets = [
      { id: "budget1", categoryId: "cat1", amount: "800", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget2", categoryId: "cat2", amount: "200", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget3", categoryId: "cat3", amount: "400", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget4", categoryId: "cat4", amount: "300", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget5", categoryId: "cat5", amount: "400", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget6", categoryId: "cat6", amount: "1100", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget7", categoryId: "cat7", amount: "1000", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget8", categoryId: "cat8", amount: "1000", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget9", categoryId: "cat9", amount: "400", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget10", categoryId: "cat10", amount: "225", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget11", categoryId: "cat11", amount: "500", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
      { id: "budget12", categoryId: "cat12", amount: "200", period: "monthly", householdId: defaultHousehold.id, createdAt: new Date() },
    ];
    
    defaultBudgets.forEach(budget => {
      this.budgets.set(budget.id, budget);
    });

    // Create some default crypto holdings
    const defaultCryptoHoldings = [
      { 
        id: "crypto1", 
        householdId: defaultHousehold.id, 
        symbol: "XRP", 
        name: "XRP", 
        amount: "22000", 
        platform: "Coinbase",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: "crypto2", 
        householdId: defaultHousehold.id, 
        symbol: "TOBY", 
        name: "$TOBY", 
        amount: "1150000000000", 
        platform: "DEX",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];
    
    defaultCryptoHoldings.forEach(holding => {
      this.cryptoHoldings.set(holding.id, holding);
    });
  }

  getDefaultCategories(): Category[] {
    return [
      { id: "cat1", name: "Groceries", icon: "fas fa-shopping-cart", color: "#2563EB", householdId: "" },
      { id: "cat2", name: "Transportation/Maintenance", icon: "fas fa-car", color: "#059669", householdId: "" },
      { id: "cat3", name: "Utilities", icon: "fas fa-bolt", color: "#DC2626", householdId: "" },
      { id: "cat4", name: "Healthcare", icon: "fas fa-heartbeat", color: "#DB2777", householdId: "" },
      { id: "cat5", name: "Personal Expenses", icon: "fas fa-user", color: "#7C3AED", householdId: "" },
      { id: "cat6", name: "Student Loan", icon: "fas fa-graduation-cap", color: "#F59E0B", householdId: "" },
      { id: "cat7", name: "Credit Card Payments", icon: "fas fa-credit-card", color: "#EF4444", householdId: "" },
      { id: "cat8", name: "Savings for House", icon: "fas fa-home", color: "#10B981", householdId: "" },
      { id: "cat9", name: "Buffer/Emergency", icon: "fas fa-shield-alt", color: "#6B7280", householdId: "" },
      { id: "cat10", name: "Pilates", icon: "fas fa-dumbbell", color: "#8B5CF6", householdId: "" },
      { id: "cat11", name: "Mattress", icon: "fas fa-bed", color: "#EC4899", householdId: "" },
      { id: "cat12", name: "Clothing and Household Items", icon: "fas fa-tshirt", color: "#F97316", householdId: "" },
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      householdId: insertUser.householdId || null,
      avatar: insertUser.avatar || null
    };
    this.users.set(id, user);
    return user;
  }

  async getHousehold(id: string): Promise<Household | undefined> {
    return this.households.get(id);
  }

  async createHousehold(insertHousehold: InsertHousehold): Promise<Household> {
    const id = randomUUID();
    const household: Household = { 
      ...insertHousehold, 
      id, 
      createdAt: new Date() 
    };
    this.households.set(id, household);
    return household;
  }

  async getHouseholdMembers(householdId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.householdId === householdId);
  }

  async getCategories(householdId: string): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(category => category.householdId === householdId);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { 
      ...insertCategory, 
      id,
      householdId: insertCategory.householdId || null
    };
    this.categories.set(id, category);
    return category;
  }

  async getBudgets(householdId: string): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(budget => budget.householdId === householdId);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = { 
      ...insertBudget, 
      id, 
      createdAt: new Date(),
      categoryId: insertBudget.categoryId || null,
      householdId: insertBudget.householdId || null
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updateData: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const updatedBudget = { ...budget, ...updateData };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async getExpenses(householdId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.householdId === householdId)
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = { 
      ...insertExpense, 
      id, 
      amount: String(insertExpense.amount),
      date: insertExpense.date || new Date(),
      createdAt: new Date(),
      categoryId: insertExpense.categoryId || null,
      userId: insertExpense.userId || null,
      householdId: insertExpense.householdId || null,
      isShared: insertExpense.isShared || null,
      receiptImage: insertExpense.receiptImage || null
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getExpensesByCategory(householdId: string, categoryId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.householdId === householdId && expense.categoryId === categoryId);
  }

  async getExpensesByDateRange(householdId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => 
        expense.householdId === householdId && 
        expense.date && 
        expense.date >= startDate && 
        expense.date <= endDate
      );
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const id = randomUUID();
    const receipt: Receipt = { 
      ...insertReceipt, 
      id, 
      createdAt: new Date(),
      expenseId: insertReceipt.expenseId || null,
      ocrText: insertReceipt.ocrText || null,
      extractedAmount: insertReceipt.extractedAmount || null,
      extractedDate: insertReceipt.extractedDate || null
    };
    this.receipts.set(id, receipt);
    return receipt;
  }

  async getReceiptsByExpense(expenseId: string): Promise<Receipt[]> {
    return Array.from(this.receipts.values()).filter(receipt => receipt.expenseId === expenseId);
  }

  async getCryptoHoldings(householdId: string): Promise<CryptoHolding[]> {
    return Array.from(this.cryptoHoldings.values()).filter(holding => holding.householdId === householdId);
  }

  async createCryptoHolding(insertHolding: InsertCryptoHolding): Promise<CryptoHolding> {
    const id = randomUUID();
    const holding: CryptoHolding = { 
      ...insertHolding, 
      id, 
      amount: String(insertHolding.amount),
      createdAt: new Date(),
      updatedAt: new Date(),
      householdId: insertHolding.householdId || null,
      platform: insertHolding.platform || null
    };
    this.cryptoHoldings.set(id, holding);
    return holding;
  }

  async updateCryptoHolding(id: string, updateData: Partial<InsertCryptoHolding>): Promise<CryptoHolding | undefined> {
    const holding = this.cryptoHoldings.get(id);
    if (!holding) return undefined;
    
    const updatedHolding = { 
      ...holding, 
      ...updateData,
      amount: updateData.amount ? String(updateData.amount) : holding.amount,
      updatedAt: new Date()
    };
    this.cryptoHoldings.set(id, updatedHolding);
    return updatedHolding;
  }

  async deleteCryptoHolding(id: string): Promise<boolean> {
    return this.cryptoHoldings.delete(id);
  }
}

export const storage = new MemStorage();
