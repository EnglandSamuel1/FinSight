-- Add confidence field to transactions table for categorization confidence tracking
-- Confidence is stored as an integer from 0-100

ALTER TABLE transactions
ADD COLUMN confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100);

-- Create index for filtering by confidence (e.g., finding low-confidence categorizations)
CREATE INDEX IF NOT EXISTS idx_transactions_confidence ON transactions(confidence);

-- Add comment to document the field
COMMENT ON COLUMN transactions.confidence IS 'Categorization confidence score (0-100). NULL indicates no categorization attempted.';
