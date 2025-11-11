-- Create budgets table for manual budget allocations
CREATE TABLE IF NOT EXISTS budgets (
  num_id SERIAL UNIQUE,
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR REFERENCES locations(id),
  expense_type TEXT,
  category TEXT,
  month INTEGER CHECK (month IS NULL OR (month >= 1 AND month <= 12)),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  amount NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure only one budget per (location, year, month, expense_type, category)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_budgets_scope
ON budgets(
  COALESCE(location_id, 'ALL'),
  year,
  COALESCE(month, 0),
  COALESCE(expense_type, ''),
  COALESCE(category, '')
);

