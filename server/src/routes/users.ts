import { Router, Request, Response } from 'express';
import { getUsersWithFilters } from '../services/userService';
import { QueryParams } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string | undefined;

    // Parse nationalities (comma-separated string to array)
    let nationalities: string[] | undefined;
    if (req.query.nationalities) {
      nationalities = (req.query.nationalities as string)
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0);
      if (nationalities.length === 0) {
        nationalities = undefined;
      }
    }

    // Parse hobbies (comma-separated string to array)
    let hobbies: string[] | undefined;
    if (req.query.hobbies) {
      hobbies = (req.query.hobbies as string)
        .split(',')
        .map(h => h.trim())
        .filter(h => h.length > 0);
      if (hobbies.length === 0) {
        hobbies = undefined;
      }
    }

    // Parse sortBy with validation
    const validSortFields = ['first_name', 'last_name', 'age', 'nationality', 'id'];
    const sortBy = validSortFields.includes(req.query.sortBy as string)
      ? (req.query.sortBy as 'first_name' | 'last_name' | 'age' | 'nationality' | 'id')
      : 'id';

    // Parse sortOrder with validation
    const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const params: QueryParams = {
      page,
      limit,
      search,
      nationalities,
      hobbies,
      sortBy,
      sortOrder
    };

    // Get users with filters
    const response = getUsersWithFilters(params);

    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
