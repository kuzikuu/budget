import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { householdId } = req.query;
    
    if (!householdId || typeof householdId !== 'string') {
      res.status(400).json({ message: 'Household ID is required' });
      return;
    }

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

    res.status(200).json(expensesWithUsers);
  } catch (error) {
    console.error('Expenses API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
