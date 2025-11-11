-- Create categorization_rules table
CREATE TABLE IF NOT EXISTS categorization_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant_pattern TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  confidence INTEGER DEFAULT 100, -- 0-100 confidence score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, merchant_pattern, category_id)
);

-- Create index as specified in architecture
CREATE INDEX IF NOT EXISTS idx_categorization_rules_user ON categorization_rules(user_id);

-- Create trigger for updated_at on categorization_rules
CREATE TRIGGER update_categorization_rules_updated_at
  BEFORE UPDATE ON categorization_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
