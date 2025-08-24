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

    const categories = await storage.getCategories(householdId);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
