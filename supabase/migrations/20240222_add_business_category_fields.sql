-- Migration: Add business category fields to user_profiles
-- This supports the new general business path alongside social enterprise

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS business_category TEXT,
ADD COLUMN IF NOT EXISTS target_customer TEXT,
ADD COLUMN IF NOT EXISTS business_model_preference TEXT,
ADD COLUMN IF NOT EXISTS key_skills TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.business_category IS 'Business category selection: food_beverage, health_wellness, education, technology, ecommerce, professional_services, creative_arts, real_estate, social_enterprise, other';
COMMENT ON COLUMN user_profiles.target_customer IS 'Target customer type: b2b, b2c, b2g, other (general business path)';
COMMENT ON COLUMN user_profiles.business_model_preference IS 'Business model preference: product, service, subscription, marketplace (general business path)';
COMMENT ON COLUMN user_profiles.key_skills IS 'Array of key skills the user brings (general business path)';

-- Create index for business_category since it determines the user path
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_category ON user_profiles(business_category);
