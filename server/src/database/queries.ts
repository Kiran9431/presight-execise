import { getDatabase } from './connection';
import { User, FilterOption, QueryParams } from '../types';
import Database from 'better-sqlite3';

interface UserRow {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
}

/**
 * Builds WHERE clause conditions and parameters for user filtering
 */
function buildWhereClause(params: QueryParams): { conditions: string[]; values: any[] } {
  const conditions: string[] = [];
  const values: any[] = [];

  // Text search on first_name and last_name
  if (params.search) {
    conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ?)');
    const searchPattern = `%${params.search}%`;
    values.push(searchPattern, searchPattern);
  }

  // Nationality filter (OR logic - match any)
  if (params.nationalities && params.nationalities.length > 0) {
    const placeholders = params.nationalities.map(() => '?').join(',');
    conditions.push(`u.nationality IN (${placeholders})`);
    values.push(...params.nationalities);
  }

  return { conditions, values };
}

/**
 * Builds a CTE for filtered users including hobby filters
 */
function buildFilteredUsersCTE(params: QueryParams): { cte: string; values: any[] } {
  const { conditions, values } = buildWhereClause(params);

  // Start building the CTE
  let cte = `
    WITH filtered_users AS (
      SELECT DISTINCT u.id
      FROM users u
  `;

  // Add hobby filter if present (AND logic - must have ALL selected hobbies)
  if (params.hobbies && params.hobbies.length > 0) {
    cte += `
      INNER JOIN user_hobbies uh ON u.id = uh.user_id
      INNER JOIN hobbies h ON uh.hobby_id = h.id
    `;

    // Add hobby name condition
    const hobbyPlaceholders = params.hobbies.map(() => '?').join(',');
    conditions.push(`h.name IN (${hobbyPlaceholders})`);
    values.push(...params.hobbies);
  }

  // Add WHERE clause if there are conditions
  if (conditions.length > 0) {
    cte += `WHERE ${conditions.join(' AND ')}\n`;
  }

  // For hobby AND logic: group by user and ensure they have ALL selected hobbies
  if (params.hobbies && params.hobbies.length > 0) {
    cte += `
      GROUP BY u.id
      HAVING COUNT(DISTINCT h.name) = ?
    `;
    values.push(params.hobbies.length);
  }

  cte += '    )';

  return { cte, values };
}

/**
 * Gets paginated users with all filters applied
 */
export function getUsers(params: QueryParams): User[] {
  const db = getDatabase();
  const { cte, values } = buildFilteredUsersCTE(params);

  // Build the main query
  const orderByColumn = params.sortBy;
  const orderDirection = params.sortOrder.toUpperCase();

  const query = `
    ${cte}
    SELECT u.*
    FROM users u
    WHERE u.id IN (SELECT id FROM filtered_users)
    ORDER BY ${orderByColumn} ${orderDirection}, id ASC
    LIMIT ? OFFSET ?
  `;

  const offset = (params.page - 1) * params.limit;
  const stmt = db.prepare(query);
  const userRows = stmt.all(...values, params.limit, offset) as UserRow[];

  // Get hobbies for each user
  const userIds = userRows.map(u => u.id);
  if (userIds.length === 0) {
    return [];
  }

  const hobbyStmt = db.prepare(`
    SELECT uh.user_id, h.name
    FROM user_hobbies uh
    INNER JOIN hobbies h ON uh.hobby_id = h.id
    WHERE uh.user_id IN (${userIds.map(() => '?').join(',')})
    ORDER BY h.name ASC
  `);

  const hobbyRows = hobbyStmt.all(...userIds) as Array<{ user_id: number; name: string }>;

  // Group hobbies by user_id
  const hobbiesByUser = new Map<number, string[]>();
  for (const row of hobbyRows) {
    if (!hobbiesByUser.has(row.user_id)) {
      hobbiesByUser.set(row.user_id, []);
    }
    hobbiesByUser.get(row.user_id)!.push(row.name);
  }

  // Map to User objects
  return userRows.map((row) => ({
    id: row.id,
    avatar: row.avatar,
    firstName: row.first_name,
    lastName: row.last_name,
    age: row.age,
    nationality: row.nationality,
    hobbies: hobbiesByUser.get(row.id) || []
  }));
}

/**
 * Gets total count of filtered users
 */
export function getTotalCount(params: QueryParams): number {
  const db = getDatabase();
  const { cte, values } = buildFilteredUsersCTE(params);

  const query = `
    ${cte}
    SELECT COUNT(*) as count
    FROM filtered_users
  `;

  const stmt = db.prepare(query);
  const result = stmt.get(...values) as { count: number };
  return result.count;
}

/**
 * Gets top 20 hobbies for the current filter state with counts
 */
export function getTopHobbies(params: QueryParams): FilterOption[] {
  const db = getDatabase();
  const { cte, values } = buildFilteredUsersCTE(params);

  const query = `
    ${cte}
    SELECT h.name as value, COUNT(DISTINCT uh.user_id) as count
    FROM hobbies h
    INNER JOIN user_hobbies uh ON h.id = uh.hobby_id
    WHERE uh.user_id IN (SELECT id FROM filtered_users)
    GROUP BY h.id, h.name
    ORDER BY count DESC, h.name ASC
    LIMIT 20
  `;

  const stmt = db.prepare(query);
  return stmt.all(...values) as FilterOption[];
}

/**
 * Gets top 20 nationalities for the current filter state with counts
 */
export function getTopNationalities(params: QueryParams): FilterOption[] {
  const db = getDatabase();
  const { cte, values } = buildFilteredUsersCTE(params);

  const query = `
    ${cte}
    SELECT u.nationality as value, COUNT(*) as count
    FROM users u
    WHERE u.id IN (SELECT id FROM filtered_users)
    GROUP BY u.nationality
    ORDER BY count DESC, u.nationality ASC
    LIMIT 20
  `;

  const stmt = db.prepare(query);
  return stmt.all(...values) as FilterOption[];
}
