-- Migration: Add audit fields and calculation persistence tables
-- This adds audit capabilities and calculation history tracking

-- 1. Add audit fields to existing tables
ALTER TABLE profit_loss_data 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id),
ADD COLUMN change_reason VARCHAR(255),
ADD COLUMN last_modified TIMESTAMP DEFAULT NOW();

ALTER TABLE balance_sheet_data 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id),
ADD COLUMN change_reason VARCHAR(255),
ADD COLUMN last_modified TIMESTAMP DEFAULT NOW();

ALTER TABLE debt_structure_data 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id),
ADD COLUMN change_reason VARCHAR(255),
ADD COLUMN last_modified TIMESTAMP DEFAULT NOW();

ALTER TABLE working_capital_data 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id),
ADD COLUMN change_reason VARCHAR(255),
ADD COLUMN last_modified TIMESTAMP DEFAULT NOW();

ALTER TABLE growth_assumptions_data 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id),
ADD COLUMN change_reason VARCHAR(255),
ADD COLUMN last_modified TIMESTAMP DEFAULT NOW();

ALTER TABLE seasonality_data 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id),
ADD COLUMN change_reason VARCHAR(255),
ADD COLUMN last_modified TIMESTAMP DEFAULT NOW();

-- 2. Create audit log table
CREATE TABLE IF NOT EXISTS data_entry_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    table_name VARCHAR(50) NOT NULL, -- 'profit_loss_data', 'balance_sheet_data', etc.
    record_id UUID NOT NULL, -- ID of the modified record
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB, -- Complete old record state
    new_values JSONB, -- Complete new record state
    changed_fields TEXT[], -- Array of field names that changed
    change_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT
);

-- 3. Create calculation runs table
CREATE TABLE IF NOT EXISTS calculation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    run_name VARCHAR(255) NOT NULL,
    run_description TEXT,
    calculation_type VARCHAR(50) NOT NULL, -- 'debt', 'depreciation', 'consolidated'
    input_data JSONB NOT NULL, -- All input parameters
    output_data JSONB, -- All calculation results
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    completed_at TIMESTAMP,
    execution_time_ms INTEGER,
    error_message TEXT
);

-- 4. Create calculation iterations table
CREATE TABLE IF NOT EXISTS calculation_iterations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_run_id UUID REFERENCES calculation_runs(id) ON DELETE CASCADE,
    iteration_number INTEGER NOT NULL,
    input_changes JSONB, -- What changed from previous iteration
    output_changes JSONB, -- What changed in results
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 5. Create calculation schedules table
CREATE TABLE IF NOT EXISTS calculation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_run_id UUID REFERENCES calculation_runs(id) ON DELETE CASCADE,
    schedule_type VARCHAR(50) NOT NULL, -- 'debt_schedule', 'depreciation_schedule', 'monthly_consolidated'
    month_number INTEGER,
    year_number INTEGER,
    schedule_data JSONB NOT NULL, -- All calculated values for this period
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_project_id ON data_entry_audit_log(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON data_entry_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON data_entry_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_calculation_runs_project_id ON calculation_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_calculation_runs_type ON calculation_runs(calculation_type);
CREATE INDEX IF NOT EXISTS idx_calculation_runs_created_at ON calculation_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_calculation_schedules_run_id ON calculation_schedules(calculation_run_id);

-- 7. Create function to automatically update last_modified
CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    NEW.version = COALESCE(OLD.version, 0) + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for automatic audit logging
CREATE OR REPLACE FUNCTION audit_data_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
BEGIN
    -- Get old and new data
    IF TG_OP = 'DELETE' THEN
        old_data = to_jsonb(OLD);
        new_data = NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data = NULL;
        new_data = to_jsonb(NEW);
    ELSE
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
    END IF;
    
    -- Determine changed fields
    IF TG_OP = 'UPDATE' THEN
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_object_keys(new_data) AS key
        WHERE new_data->key IS DISTINCT FROM old_data->key;
    END IF;
    
    -- Insert audit log
    INSERT INTO data_entry_audit_log (
        project_id,
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_fields,
        created_by
    ) VALUES (
        NEW.project_id,
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        old_data,
        new_data,
        changed_fields,
        NEW.updated_by
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for each table
CREATE TRIGGER audit_profit_loss_data_changes
    AFTER INSERT OR UPDATE OR DELETE ON profit_loss_data
    FOR EACH ROW EXECUTE FUNCTION audit_data_changes();

CREATE TRIGGER audit_balance_sheet_data_changes
    AFTER INSERT OR UPDATE OR DELETE ON balance_sheet_data
    FOR EACH ROW EXECUTE FUNCTION audit_data_changes();

CREATE TRIGGER audit_debt_structure_data_changes
    AFTER INSERT OR UPDATE OR DELETE ON debt_structure_data
    FOR EACH ROW EXECUTE FUNCTION audit_data_changes();

CREATE TRIGGER audit_working_capital_data_changes
    AFTER INSERT OR UPDATE OR DELETE ON working_capital_data
    FOR EACH ROW EXECUTE FUNCTION audit_data_changes();

CREATE TRIGGER audit_growth_assumptions_data_changes
    AFTER INSERT OR UPDATE OR DELETE ON growth_assumptions_data
    FOR EACH ROW EXECUTE FUNCTION audit_data_changes();

CREATE TRIGGER audit_seasonality_data_changes
    AFTER INSERT OR UPDATE OR DELETE ON seasonality_data
    FOR EACH ROW EXECUTE FUNCTION audit_data_changes();

-- 10. Create function to clean old calculation runs (keep last 10)
CREATE OR REPLACE FUNCTION clean_old_calculation_runs()
RETURNS void AS $$
BEGIN
    DELETE FROM calculation_runs 
    WHERE id NOT IN (
        SELECT id FROM calculation_runs 
        ORDER BY created_at DESC 
        LIMIT 10
    );
END;
$$ language 'plpgsql';

-- 11. Create scheduled job to clean old runs (runs daily)
-- Note: This requires pg_cron extension
-- SELECT cron.schedule('clean-old-runs', '0 2 * * *', 'SELECT clean_old_calculation_runs();');

-- 12. Update existing records to have audit fields
UPDATE profit_loss_data SET version = 1, last_modified = created_at WHERE version IS NULL;
UPDATE balance_sheet_data SET version = 1, last_modified = created_at WHERE version IS NULL;
UPDATE debt_structure_data SET version = 1, last_modified = created_at WHERE version IS NULL;
UPDATE working_capital_data SET version = 1, last_modified = created_at WHERE version IS NULL;
UPDATE growth_assumptions_data SET version = 1, last_modified = created_at WHERE version IS NULL;
UPDATE seasonality_data SET version = 1, last_modified = created_at WHERE version IS NULL; 