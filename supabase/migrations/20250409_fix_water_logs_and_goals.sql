
-- Fix water logs stored procedures
CREATE OR REPLACE FUNCTION get_water_log(user_id_param UUID, date_param DATE)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  date DATE,
  glasses INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM water_logs 
  WHERE user_id = user_id_param AND date = date_param;
END;
$$;

CREATE OR REPLACE FUNCTION update_water_log(log_id_param UUID, glasses_param INTEGER, updated_at_param TIMESTAMPTZ)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE water_logs 
  SET glasses = glasses_param, updated_at = updated_at_param
  WHERE id = log_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION create_water_log(user_id_param UUID, date_param DATE, glasses_param INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO water_logs (user_id, date, glasses)
  VALUES (user_id_param, date_param, glasses_param);
END;
$$;

CREATE OR REPLACE FUNCTION get_water_logs_for_user(user_id_param UUID, start_date_param DATE)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  date DATE,
  glasses INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM water_logs 
  WHERE user_id = user_id_param 
  AND date >= start_date_param
  ORDER BY date DESC;
END;
$$;

-- Create stored procedures for user goals
CREATE OR REPLACE FUNCTION create_user_goal(
  user_id_param UUID, 
  goal_type_param TEXT, 
  description_param TEXT, 
  target_value_param NUMERIC DEFAULT NULL, 
  target_date_param DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  goal_type TEXT,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  target_date DATE,
  is_achieved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_goal_id UUID;
BEGIN
  INSERT INTO user_goals (
    user_id, 
    goal_type, 
    description, 
    target_value, 
    target_date
  )
  VALUES (
    user_id_param, 
    goal_type_param, 
    description_param, 
    target_value_param, 
    target_date_param
  )
  RETURNING id INTO new_goal_id;
  
  RETURN QUERY 
  SELECT * FROM user_goals 
  WHERE id = new_goal_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_goals(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  goal_type TEXT,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  target_date DATE,
  is_achieved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM user_goals 
  WHERE user_id = user_id_param
  ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION update_user_goal(
  goal_id_param UUID,
  description_param TEXT DEFAULT NULL,
  target_value_param NUMERIC DEFAULT NULL,
  current_value_param NUMERIC DEFAULT NULL,
  target_date_param DATE DEFAULT NULL,
  is_achieved_param BOOLEAN DEFAULT NULL,
  updated_at_param TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  goal_type TEXT,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  target_date DATE,
  is_achieved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_goals
  SET 
    description = COALESCE(description_param, description),
    target_value = COALESCE(target_value_param, target_value),
    current_value = COALESCE(current_value_param, current_value),
    target_date = COALESCE(target_date_param, target_date),
    is_achieved = COALESCE(is_achieved_param, is_achieved),
    updated_at = updated_at_param
  WHERE id = goal_id_param;
  
  RETURN QUERY 
  SELECT * FROM user_goals 
  WHERE id = goal_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION delete_user_goal(goal_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_goals
  WHERE id = goal_id_param;
END;
$$;
