import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import Tesseract from "tesseract.js";
import { storage } from "./storage";
import { insertExpenseSchema, insertBudgetSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import express from "express";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard data
  app.get("/api/dashboard/:householdId", async (req, res) => {
    try {
      const { householdId } = req.params;
      
      const expenses = await storage.getExpenses(householdId);
      const budgets = await storage.getBudgets(householdId);
      const categories = await storage.getCategories(householdId);
      const members = await storage.getHouseholdMembers(householdId);

      // Calculate current month expenses
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyExpenses = await storage.getExpensesByDateRange(householdId, startOfMonth, now);
      
      const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
      const remaining = totalBudget - totalSpent;
      const dailyAverage = totalSpent / now.getDate();

      // Calculate category progress
      const categoryProgress = categories.map(category => {
        const categoryBudget = budgets.find(b => b.categoryId === category.id);
        const categoryExpenses = monthlyExpenses.filter(e => e.categoryId === category.id);
        const spent = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const budgetAmount = categoryBudget ? parseFloat(categoryBudget.amount) : 0;
        const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

        return {
          ...category,
          spent,
          budget: budgetAmount,
          remaining: budgetAmount - spent,
          percentage,
        };
      });

      res.json({
        summary: {
          monthlyBudget: totalBudget,
          spent: totalSpent,
          remaining,
          dailyAverage,
        },
        categoryProgress,
        recentExpenses: expenses.slice(0, 10),
        members,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to load dashboard data" });
    }
  });

  // Get expenses
  app.get("/api/expenses/:householdId", async (req, res) => {
    try {
      const { householdId } = req.params;
      const expenses = await storage.getExpenses(householdId);
      
      // Get user information for each expense
      const expensesWithUsers = await Promise.all(
        expenses.map(async (expense) => {
          const user = expense.userId ? await storage.getUser(expense.userId) : null;
          return {
            ...expense,
            user: user ? { id: user.id, username: user.username, avatar: user.avatar } : null,
          };
        })
      );

      res.json(expensesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to load expenses" });
    }
  });

  // Create expense
  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  // Get categories
  app.get("/api/categories/:householdId", async (req, res) => {
    try {
      const { householdId } = req.params;
      const categories = await storage.getCategories(householdId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to load categories" });
    }
  });

  // Get budgets
  app.get("/api/budgets/:householdId", async (req, res) => {
    try {
      const { householdId } = req.params;
      const budgets = await storage.getBudgets(householdId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to load budgets" });
    }
  });

  // Create or update budget
  app.post("/api/budgets", async (req, res) => {
    try {
      const budgetData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create budget" });
      }
    }
  });

  // Upload and process receipt
  app.post("/api/receipts/process", upload.single('receipt'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const { householdId, userId } = req.body;
      if (!householdId) {
        return res.status(400).json({ message: "Household ID is required" });
      }

      // Process image with Sharp for better OCR results
      const processedImageBuffer = await sharp(req.file.buffer)
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();

      // Perform OCR with Tesseract
      const { data: { text } } = await Tesseract.recognize(processedImageBuffer, 'eng', {
        logger: m => console.log(m)
      });

      // Extract amount and date from OCR text
      const extractedData = extractReceiptData(text);

      // Save image (in production, you'd save to cloud storage)
      const imageId = randomUUID();
      const imageUrl = `/uploads/${imageId}.jpg`;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Save processed image
      await sharp(processedImageBuffer)
        .jpeg({ quality: 80 })
        .toFile(path.join(uploadsDir, `${imageId}.jpg`));

      res.json({
        imageUrl,
        ocrText: text,
        extractedAmount: extractedData.amount,
        extractedDate: extractedData.date,
        suggestedCategory: extractedData.category,
      });

    } catch (error) {
      console.error('Receipt processing error:', error);
      res.status(500).json({ message: "Failed to process receipt" });
    }
  });

  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}

function extractReceiptData(ocrText: string) {
  const result = {
    amount: null as number | null,
    date: null as Date | null,
    category: null as string | null,
  };

  // Extract amount - look for patterns like $XX.XX, XX.XX, TOTAL XX.XX
  const amountPatterns = [
    /(?:total|amount|sum)[\s:]*\$?(\d+\.?\d{0,2})/i,
    /\$(\d+\.\d{2})/g,
    /(\d+\.\d{2})(?=\s*$)/m
  ];

  for (const pattern of amountPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (amount > 0 && amount < 10000) { // Reasonable bounds
        result.amount = amount;
        break;
      }
    }
  }

  // Extract date - look for various date formats
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\w+\s+\d{1,2},?\s+\d{4})/i
  ];

  for (const pattern of datePatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      const parsedDate = new Date(match[1]);
      if (!isNaN(parsedDate.getTime())) {
        result.date = parsedDate;
        break;
      }
    }
  }

  // Suggest category based on merchant/content
  const categoryKeywords = {
    'Groceries': ['market', 'grocery', 'food', 'supermarket', 'walmart', 'target', 'whole foods', 'kroger'],
    'Transportation': ['gas', 'fuel', 'shell', 'exxon', 'bp', 'parking', 'uber', 'lyft'],
    'Dining Out': ['restaurant', 'cafe', 'pizza', 'burger', 'starbucks', 'mcdonalds', 'dining'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment'],
    'Healthcare': ['pharmacy', 'doctor', 'medical', 'hospital', 'cvs', 'walgreens'],
    'Utilities': ['electric', 'power', 'water', 'internet', 'phone', 'cable']
  };

  const lowerText = ocrText.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      result.category = category;
      break;
    }
  }

  return result;
}
