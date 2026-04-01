import { pgTable, serial, varchar, integer, boolean, timestamp, text, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  role: varchar('role', { length: 50 }).notNull(),
  roleLabel: varchar('role_label', { length: 100 }).notNull(),
  brand: varchar('brand', { length: 100 }),
  shop: varchar('shop', { length: 100 }),
  invitedBy: varchar('invited_by', { length: 255 }),
  status: varchar('status', { length: 20 }).default('pending'),
  passwordHash: varchar('password_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  shop: varchar('shop', { length: 100 }),
  location: varchar('location', { length: 100 }),
  budget: integer('budget').default(0),
  disbursed: integer('disbursed').default(0),
  shopCount: integer('shop_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  requestId: varchar('request_id', { length: 50 }).notNull(),
  date: varchar('date', { length: 20 }),
  brand: varchar('brand', { length: 100 }),
  shop: varchar('shop', { length: 100 }),
  location: varchar('location', { length: 100 }),
  category: varchar('category', { length: 100 }),
  supplier: varchar('supplier', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 30 }),
  wallet: varchar('wallet', { length: 50 }),
  manager: varchar('manager', { length: 255 }),
  txnRef: varchar('txn_ref', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const innbucks_sales = pgTable('innbucks_sales', {
  id: serial('id').primaryKey(),
  brand: varchar('brand', { length: 100 }),
  shop: varchar('shop', { length: 100 }),
  location: varchar('location', { length: 100 }),
  sales: decimal('sales', { precision: 10, scale: 2 }),
  transactions: integer('transactions'),
  avgBasket: decimal('avg_basket', { precision: 10, scale: 2 }),
  trend: integer('trend'),
  date: varchar('date', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  mtdSpend: decimal('mtd_spend', { precision: 10, scale: 2 }),
  ytdSpend: decimal('ytd_spend', { precision: 10, scale: 2 }),
  brands: varchar('brands', { length: 255 }),
  trend: integer('trend'),
  verified: boolean('verified').default(false),
  certExpiry: varchar('cert_expiry', { length: 30 }),
  wallet: varchar('wallet', { length: 50 }),
  shop: varchar('shop', { length: 100 }),
  location: varchar('location', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const budget_allocations = pgTable('budget_allocations', {
  id: serial('id').primaryKey(),
  shop: varchar('shop', { length: 100 }),
  location: varchar('location', { length: 100 }),
  monthlyBudget: integer('monthly_budget').default(0),
  disbursed: integer('disbursed').default(0),
  allocatedTo: varchar('allocated_to', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const system_logs = pgTable('system_logs', {
  id: serial('id').primaryKey(),
  color: varchar('color', { length: 30 }),
  time: varchar('time', { length: 30 }),
  text: text('text'),
  user: varchar('user', { length: 255 }),
  chip: varchar('chip', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});
