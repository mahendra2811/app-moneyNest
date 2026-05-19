import { db } from './client';
import { accounts, categories } from './schema';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';

const DEFAULT_EXPENSE_CATEGORIES: Array<{
  name: string;
  icon: string;
  color: string;
  slug: string;
}> = [
  { name: 'Food & Drink', icon: 'utensils', color: '#F59E0B', slug: 'food' },
  { name: 'Groceries', icon: 'shopping-cart', color: '#84CC16', slug: 'groceries' },
  { name: 'Transport', icon: 'car', color: '#3B82F6', slug: 'transport' },
  { name: 'Fuel', icon: 'fuel', color: '#EF4444', slug: 'fuel' },
  { name: 'Bills', icon: 'receipt', color: '#6366F1', slug: 'bills' },
  { name: 'Rent', icon: 'home', color: '#8B5CF6', slug: 'rent' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#EC4899', slug: 'shopping' },
  { name: 'Entertainment', icon: 'film', color: '#F43F5E', slug: 'entertainment' },
  { name: 'Health', icon: 'heart-pulse', color: '#14B8A6', slug: 'health' },
  { name: 'Education', icon: 'graduation-cap', color: '#0EA5E9', slug: 'education' },
  { name: 'Personal Care', icon: 'sparkles', color: '#A855F7', slug: 'personal' },
  { name: 'Other', icon: 'more-horizontal', color: '#64748B', slug: 'other' },
];

const DEFAULT_INCOME_CATEGORIES: Array<{
  name: string;
  icon: string;
  color: string;
  slug: string;
}> = [
  { name: 'Salary', icon: 'briefcase', color: '#16A34A', slug: 'salary' },
  { name: 'Freelance', icon: 'laptop', color: '#0EA5E9', slug: 'freelance' },
  { name: 'Refund', icon: 'rotate-ccw', color: '#8B5CF6', slug: 'refund' },
  { name: 'Other Income', icon: 'plus-circle', color: '#64748B', slug: 'other_income' },
];

export async function seedIfEmpty(): Promise<void> {
  const existingAccounts = await db.select().from(accounts).limit(1);
  if (existingAccounts.length === 0) {
    const ts = now();
    await db.insert(accounts).values({
      id: uuidv7(),
      name: 'Cash',
      type: 'cash',
      startingBalancePaise: 0,
      currency: 'INR',
      icon: 'wallet',
      color: '#16A34A',
      sortOrder: 0,
      isArchived: false,
      createdAt: ts,
      updatedAt: ts,
    });
  }

  const existingCats = await db.select().from(categories).limit(1);
  if (existingCats.length === 0) {
    const ts = now();
    const rows = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((c, i) => ({
        id: uuidv7(),
        name: c.name,
        type: 'expense' as const,
        icon: c.icon,
        color: c.color,
        slug: c.slug,
        sortOrder: i,
        isArchived: false,
        isDefault: true,
        createdAt: ts,
        updatedAt: ts,
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((c, i) => ({
        id: uuidv7(),
        name: c.name,
        type: 'income' as const,
        icon: c.icon,
        color: c.color,
        slug: c.slug,
        sortOrder: i,
        isArchived: false,
        isDefault: true,
        createdAt: ts,
        updatedAt: ts,
      })),
    ];
    for (const r of rows) {
      await db.insert(categories).values(r);
    }
  }
}
