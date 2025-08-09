-- Delete all KPI data for the specific project
DELETE FROM monthly_kpis WHERE project_id = '05632bb7-b506-453d-9ca1-253344e04b6b';
DELETE FROM quarterly_kpis WHERE project_id = '05632bb7-b506-453d-9ca1-253344e04b6b';
DELETE FROM yearly_kpis WHERE project_id = '05632bb7-b506-453d-9ca1-253344e04b6b';

-- Also delete any calculation runs for KPI calculations
DELETE FROM calculation_runs WHERE project_id = '05632bb7-b506-453d-9ca1-253344e04b6b' AND calculation_type LIKE '%kpi%'; 