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

    const budgets = await storage.getBudgets(householdId);
    res.status(200).json(budgets);
  } catch (error) {
    console.error('Budgets API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
