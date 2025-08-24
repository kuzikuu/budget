import { type User, type InsertUser, type Household, type InsertHousehold, type Category, type InsertCategory, type Budget, type InsertBudget, type Expense, type InsertExpense, type Receipt, type InsertReceipt } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private households: Map<string, Household> = new Map();
  private categories: Map<string, Category> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private receipts: Map<string, Receipt> = new Map();

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
  }

  getDefaultCategories(): Category[] {
    return [
      { id: "cat1", name: "Groceries", icon: "fas fa-shopping-cart", color: "#2563EB", householdId: "" },
      { id: "cat2", name: "Transportation", icon: "fas fa-gas-pump", color: "#059669", householdId: "" },
      { id: "cat3", name: "Entertainment", icon: "fas fa-film", color: "#7C3AED", householdId: "" },
      { id: "cat4", name: "Dining Out", icon: "fas fa-utensils", color: "#EA580C", householdId: "" },
      { id: "cat5", name: "Utilities", icon: "fas fa-bolt", color: "#DC2626", householdId: "" },
      { id: "cat6", name: "Healthcare", icon: "fas fa-heartbeat", color: "#DB2777", householdId: "" },
      { id: "cat7", name: "Other", icon: "fas fa-question", color: "#64748B", householdId: "" },
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
}

export const storage = new MemStorage();
