import { faker } from '@faker-js/faker';
import { getDatabase, closeDatabase } from './connection';
import { initializeSchema } from './schema';

const USER_COUNT = 10000;
const HOBBY_POOL = [
  'Reading', 'Writing', 'Photography', 'Painting', 'Drawing', 'Hiking', 'Running',
  'Swimming', 'Cycling', 'Yoga', 'Meditation', 'Cooking', 'Baking', 'Gardening',
  'Gaming', 'Board Games', 'Chess', 'Traveling', 'Camping', 'Fishing', 'Skiing',
  'Surfing', 'Rock Climbing', 'Dancing', 'Singing', 'Playing Guitar', 'Playing Piano',
  'Playing Drums', 'Knitting', 'Sewing', 'Woodworking', 'Pottery', 'Sculpture',
  'Volunteering', 'Bird Watching', 'Astronomy', 'Collecting Coins', 'Collecting Stamps',
  'Magic Tricks', 'Juggling', 'Archery', 'Fencing', 'Martial Arts', 'Boxing',
  'Tennis', 'Basketball', 'Football', 'Baseball', 'Golf', 'Bowling', 'Billiards',
  'Darts', 'Crossword Puzzles', 'Sudoku', 'Model Building', 'Electronics', 'Programming',
  'Blogging', 'Podcasting', 'Video Editing', 'Animation', 'Stand-up Comedy',
  'Wine Tasting', 'Coffee Roasting', 'Homebrewing', 'Beekeeping', 'Calligraphy',
  'Origami', 'Scrapbooking', 'Genealogy', 'Antique Collecting', 'Car Restoration',
  'Motorcycling', 'Sailing', 'Kayaking', 'Scuba Diving', 'Skydiving', 'Paragliding',
  'Mountain Biking', 'Skateboarding', 'Rollerblading', 'Ice Skating', 'Snowboarding',
  'Horseback Riding', 'Dog Training', 'Cat Care', 'Aquarium Keeping', 'Reptile Care',
  'Meteorology', 'Geology', 'Botany', 'Amateur Radio', 'Drone Flying', 'Kite Flying'
];

const NATIONALITY_POOL = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Belgium', 'Switzerland', 'Austria', 'Ireland', 'New Zealand', 'Japan', 'South Korea',
  'Singapore', 'India', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Portugal', 'Greece'
];

function generateAvatarUrl(userId: number): string {
  // Using DiceBear API for deterministic avatars
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
}

function getRandomHobbies(min: number = 0, max: number = 10): string[] {
  const count = faker.number.int({ min, max });
  const shuffled = [...HOBBY_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function seed() {
  console.log('Starting database seeding...');

  const db = getDatabase();

  // Initialize schema first
  initializeSchema();

  // Check if database is already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log(`Database already contains ${userCount.count} users. Skipping seed.`);
    closeDatabase();
    return;
  }

  console.log('Inserting hobbies...');

  // Insert hobbies
  const insertHobby = db.prepare('INSERT INTO hobbies (name) VALUES (?)');
  const hobbyIds: Map<string, number> = new Map();

  for (const hobby of HOBBY_POOL) {
    const result = insertHobby.run(hobby);
    hobbyIds.set(hobby, result.lastInsertRowid as number);
  }

  console.log(`Inserted ${HOBBY_POOL.length} hobbies.`);

  console.log(`Generating ${USER_COUNT} users...`);

  // Prepare statements for bulk insert
  const insertUser = db.prepare(`
    INSERT INTO users (avatar, first_name, last_name, age, nationality)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertUserHobby = db.prepare(`
    INSERT INTO user_hobbies (user_id, hobby_id)
    VALUES (?, ?)
  `);

  // Use transaction for better performance
  const insertMany = db.transaction((users: Array<{
    avatar: string;
    firstName: string;
    lastName: string;
    age: number;
    nationality: string;
    hobbies: string[];
  }>) => {
    for (const user of users) {
      const result = insertUser.run(
        user.avatar,
        user.firstName,
        user.lastName,
        user.age,
        user.nationality
      );

      const userId = result.lastInsertRowid as number;

      // Insert user hobbies
      for (const hobby of user.hobbies) {
        const hobbyId = hobbyIds.get(hobby);
        if (hobbyId) {
          insertUserHobby.run(userId, hobbyId);
        }
      }
    }
  });

  // Generate users in batches for progress tracking
  const BATCH_SIZE = 1000;
  for (let i = 0; i < USER_COUNT; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, USER_COUNT - i);
    const batch = [];

    for (let j = 0; j < batchSize; j++) {
      const userId = i + j + 1;
      batch.push({
        avatar: generateAvatarUrl(userId),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
        nationality: faker.helpers.arrayElement(NATIONALITY_POOL),
        hobbies: getRandomHobbies()
      });
    }

    insertMany(batch);
    console.log(`Inserted ${i + batchSize} / ${USER_COUNT} users...`);
  }

  console.log('Seeding completed successfully!');

  // Print some statistics
  const stats = db.prepare(`
    SELECT
      COUNT(*) as user_count,
      AVG(age) as avg_age
    FROM users
  `).get() as { user_count: number; avg_age: number };

  const hobbyStats = db.prepare(`
    SELECT COUNT(*) as total_assignments
    FROM user_hobbies
  `).get() as { total_assignments: number };

  console.log(`\nDatabase Statistics:`);
  console.log(`- Total Users: ${stats.user_count}`);
  console.log(`- Average Age: ${stats.avg_age.toFixed(1)}`);
  console.log(`- Total Hobby Assignments: ${hobbyStats.total_assignments}`);
  console.log(`- Average Hobbies per User: ${(hobbyStats.total_assignments / stats.user_count).toFixed(1)}`);

  closeDatabase();
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed().catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
}

export { seed };
