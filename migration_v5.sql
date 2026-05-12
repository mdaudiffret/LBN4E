-- Extend user_codes to support 20 codes (was limited to 0-8)
ALTER TABLE user_codes DROP CONSTRAINT IF EXISTS user_codes_code_index_check;
ALTER TABLE user_codes ADD CONSTRAINT user_codes_code_index_check CHECK (code_index between 0 and 19);
