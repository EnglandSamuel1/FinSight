-- Add transaction_type field to transactions table for classifying transactions as expense, income, or transfer
-- This enables accurate spending tracking by excluding transfers (e.g., credit card payments)
-- and tracking income separately from expenses

ALTER TABLE transactions
ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'expense'
CHECK (transaction_type IN ('expense', 'income', 'transfer'));

-- Create index for efficient filtering by transaction type
-- This is critical for spending calculations that exclude transfers
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

-- Add comment to document the field
COMMENT ON COLUMN transactions.transaction_type IS 'Transaction classification: expense (spending), income (revenue), or transfer (excluded from spending calculations). Defaults to expense for backward compatibility.';
