const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const JWTService = require("./auth/jwt");
const emailService = require("./services/emailJS");
const rateLimiters = require("./middleware/rateLimiter");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Apply rate limiting to all routes
app.use(rateLimiters.general);

const pool = new Pool({
  host: process.env.POSTGRESQL_HOST || "localhost",
  port: process.env.POSTGRESQL_PORT || 5432,
  database: process.env.POSTGRESQL_DATABASE || "refi_wizard",
  user: process.env.POSTGRESQL_USER || "postgres",
  password: process.env.POSTGRESQL_PASSWORD || "",
});

// Middleware to extract user from JWT token
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header provided" });
    }
    
    // Extract token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    // Verify JWT token
    const decoded = JWTService.verifyAccessToken(token);
    
    // Get user from database
    const result = await pool.query(
      `SELECT u.id, u.email, u.email_verified, p.full_name, p.user_type, ur.role
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1`,
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }
    
    const user = result.rows[0];
    
    // Check if email is verified (optional, can be disabled for testing)
    if (!user.email_verified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      return res.status(403).json({ error: "Email not verified" });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      role: user.role,
      email_verified: user.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.message === 'Invalid access token') {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    database: "PostgreSQL", 
    timestamp: new Date().toISOString() 
  });
});

// ===== PROJECTS ENDPOINTS =====

// Get all projects for a user
app.get("/api/projects", authenticateUser, async (req, res) => {
  try {
    const { company_id } = req.query;
    let query = "SELECT * FROM projects WHERE user_id = $1";
    let params = [req.user.id];

    if (company_id) {
      query += " AND company_id = $2";
      params.push(company_id);
    }

    query += " ORDER BY created_at DESC";
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get project by ID
app.get("/api/projects/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create new project
app.post("/api/projects", authenticateUser, async (req, res) => {
  try {
    const { name, description, company_id } = req.body;
    const result = await pool.query(
      "INSERT INTO projects (name, description, user_id, company_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, req.user.id, company_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
app.put("/api/projects/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, company_id } = req.body;
    
    const result = await pool.query(
      "UPDATE projects SET name = $1, description = $2, company_id = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *",
      [name, description, company_id, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
app.delete("/api/projects/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ===== PROJECT DATA ENDPOINTS =====

// Get all project data
app.get("/api/projects/:id/data", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists and belongs to user
    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Fetch all related data
    const [
      companyDetails,
      profitLossData,
      balanceSheetData,
      debtStructureData,
      growthAssumptionsData,
      workingCapitalData,
      seasonalityData,
      cashFlowData
    ] = await Promise.all([
      pool.query("SELECT * FROM company_details WHERE project_id = $1", [id]),
      pool.query("SELECT * FROM profit_loss_data WHERE project_id = $1", [id]),
      pool.query("SELECT * FROM balance_sheet_data WHERE project_id = $1", [id]),
      pool.query("SELECT * FROM debt_structure_data WHERE project_id = $1", [id]),
      pool.query("SELECT * FROM growth_assumptions_data WHERE project_id = $1", [id]),
      pool.query("SELECT * FROM working_capital_data WHERE project_id = $1", [id]),
      pool.query("SELECT * FROM seasonality_data WHERE project_id = $1", [id]),
      pool.query("SELECT * FROM cash_flow_data WHERE project_id = $1", [id])
    ]);

    res.json({
      success: true,
      data: {
        project: projectResult.rows[0],
        companyDetails: companyDetails.rows[0] || null,
        profitLossData: profitLossData.rows[0] || null,
        balanceSheetData: balanceSheetData.rows[0] || null,
        debtStructureData: debtStructureData.rows[0] || null,
        growthAssumptionsData: growthAssumptionsData.rows[0] || null,
        workingCapitalData: workingCapitalData.rows[0] || null,
        seasonalityData: seasonalityData.rows[0] || null,
        cashFlowData: cashFlowData.rows[0] || null
      }
    });
  } catch (error) {
    console.error("Error fetching project data:", error);
    res.status(500).json({ error: "Failed to fetch project data" });
  }
});

// Update project data
app.put("/api/projects/:id/data", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists and belongs to user
    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { 
      companyDetails, 
      profitLossData, 
      balanceSheetData, 
      debtStructureData,
      growthAssumptionsData,
      workingCapitalData,
      seasonalityData,
      cashFlowData
    } = req.body;

    const updates = [];

    // Update company details
    if (companyDetails) {
      updates.push(
        pool.query(
          `INSERT INTO company_details (project_id, company_name, industry, fiscal_year_end, reporting_currency)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (project_id) DO UPDATE SET
           company_name = EXCLUDED.company_name,
           industry = EXCLUDED.industry,
           fiscal_year_end = EXCLUDED.fiscal_year_end,
           reporting_currency = EXCLUDED.reporting_currency,
           updated_at = NOW()`,
          [id, companyDetails.company_name, companyDetails.industry, companyDetails.fiscal_year_end, companyDetails.reporting_currency]
        )
      );
    }

    // Update profit & loss data
    if (profitLossData) {
      updates.push(
        pool.query(
          `INSERT INTO profit_loss_data (project_id, revenue, cogs, operating_expenses, ebitda, depreciation, amortization, ebit, interest_expense, ebt, taxes, net_income)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (project_id) DO UPDATE SET
           revenue = EXCLUDED.revenue,
           cogs = EXCLUDED.cogs,
           operating_expenses = EXCLUDED.operating_expenses,
           ebitda = EXCLUDED.ebitda,
           depreciation = EXCLUDED.depreciation,
           amortization = EXCLUDED.amortization,
           ebit = EXCLUDED.ebit,
           interest_expense = EXCLUDED.interest_expense,
           ebt = EXCLUDED.ebt,
           taxes = EXCLUDED.taxes,
           net_income = EXCLUDED.net_income,
           updated_at = NOW()`,
          [id, profitLossData.revenue, profitLossData.cogs, profitLossData.operating_expenses, profitLossData.ebitda, profitLossData.depreciation, profitLossData.amortization, profitLossData.ebit, profitLossData.interest_expense, profitLossData.ebt, profitLossData.taxes, profitLossData.net_income]
        )
      );
    }

    // Update balance sheet data
    if (balanceSheetData) {
      updates.push(
        pool.query(
          `INSERT INTO balance_sheet_data (project_id, cash, accounts_receivable, inventory, prepaid_expenses, other_current_assets, total_current_assets, ppe, intangible_assets, goodwill, other_assets, total_assets, accounts_payable, accrued_expenses, short_term_debt, other_current_liabilities, total_current_liabilities, long_term_debt, other_liabilities, total_liabilities, common_stock, retained_earnings, other_equity, total_equity, total_liabilities_equity)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
           ON CONFLICT (project_id) DO UPDATE SET
           cash = EXCLUDED.cash,
           accounts_receivable = EXCLUDED.accounts_receivable,
           inventory = EXCLUDED.inventory,
           prepaid_expenses = EXCLUDED.prepaid_expenses,
           other_current_assets = EXCLUDED.other_current_assets,
           total_current_assets = EXCLUDED.total_current_assets,
           ppe = EXCLUDED.ppe,
           intangible_assets = EXCLUDED.intangible_assets,
           goodwill = EXCLUDED.goodwill,
           other_assets = EXCLUDED.other_assets,
           total_assets = EXCLUDED.total_assets,
           accounts_payable = EXCLUDED.accounts_payable,
           accrued_expenses = EXCLUDED.accrued_expenses,
           short_term_debt = EXCLUDED.short_term_debt,
           other_current_liabilities = EXCLUDED.other_current_liabilities,
           total_current_liabilities = EXCLUDED.total_current_liabilities,
           long_term_debt = EXCLUDED.long_term_debt,
           other_liabilities = EXCLUDED.other_liabilities,
           total_liabilities = EXCLUDED.total_liabilities,
           common_stock = EXCLUDED.common_stock,
           retained_earnings = EXCLUDED.retained_earnings,
           other_equity = EXCLUDED.other_equity,
           total_equity = EXCLUDED.total_equity,
           total_liabilities_equity = EXCLUDED.total_liabilities_equity,
           updated_at = NOW()`,
          [id, balanceSheetData.cash, balanceSheetData.accounts_receivable, balanceSheetData.inventory, balanceSheetData.prepaid_expenses, balanceSheetData.other_current_assets, balanceSheetData.total_current_assets, balanceSheetData.ppe, balanceSheetData.intangible_assets, balanceSheetData.goodwill, balanceSheetData.other_assets, balanceSheetData.total_assets, balanceSheetData.accounts_payable, balanceSheetData.accrued_expenses, balanceSheetData.short_term_debt, balanceSheetData.other_current_liabilities, balanceSheetData.total_current_liabilities, balanceSheetData.long_term_debt, balanceSheetData.other_liabilities, balanceSheetData.total_liabilities, balanceSheetData.common_stock, balanceSheetData.retained_earnings, balanceSheetData.other_equity, balanceSheetData.total_equity, balanceSheetData.total_liabilities_equity]
        )
      );
    }

    // Add similar blocks for other data types...
    // For brevity, I'll add a generic handler for other tables
    const otherTables = {
      debtStructureData: 'debt_structure_data',
      growthAssumptionsData: 'growth_assumptions_data',
      workingCapitalData: 'working_capital_data',
      seasonalityData: 'seasonality_data',
      cashFlowData: 'cash_flow_data'
    };

    for (const [key, tableName] of Object.entries(otherTables)) {
      const data = req.body[key];
      if (data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, index) => `$${index + 2}`).join(', ');
        const setClause = columns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
        
        updates.push(
          pool.query(
            `INSERT INTO ${tableName} (project_id, ${columns.join(', ')})
             VALUES ($1, ${placeholders})
             ON CONFLICT (project_id) DO UPDATE SET ${setClause}, updated_at = NOW()`,
            [id, ...values]
          )
        );
      }
    }

    await Promise.all(updates);
    res.json({ success: true, message: "Project data updated successfully" });
  } catch (error) {
    console.error("Error updating project data:", error);
    res.status(500).json({ error: "Failed to update project data" });
  }
});

// ===== AUTH ENDPOINTS =====

// Real auth endpoint using PostgreSQL with JWT
app.post("/api/auth", rateLimiters.login, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Get user from database
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.email_verified, 
              p.full_name, p.user_type, ur.role
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = result.rows[0];
    
    // Verify password using bcrypt
    const isValidPassword = await JWTService.comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Generate JWT tokens
    const accessToken = JWTService.generateAccessToken({
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      role: user.role
    });
    
    const refreshToken = JWTService.generateRefreshToken({
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      role: user.role
    });
    
    // Store refresh token in database
    await pool.query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          user_type: user.user_type,
          role: user.role,
          email_verified: user.email_verified
        },
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        }
      }
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// User registration endpoint with email verification
app.post("/api/auth/register", rateLimiters.registration, async (req, res) => {
  try {
    const { email, password, full_name, user_type } = req.body;
    
    if (!email || !password || !full_name || !user_type) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }
    
    // Hash password with bcrypt
    const passwordHash = await JWTService.hashPassword(password);
    
    // Create user with email verification disabled initially
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, email_verified)
       VALUES ($1, $2, false)
       RETURNING id`,
      [email, passwordHash]
    );
    
    const userId = userResult.rows[0].id;
    
    // Create profile
    await pool.query(
      `INSERT INTO profiles (user_id, email, full_name, user_type)
       VALUES ($1, $2, $3, $4)`,
      [userId, email, full_name, user_type]
    );
    
    // Assign default role
    const defaultRole = user_type === 'tech' ? 'user' : 'analyst';
    await pool.query(
      `INSERT INTO user_roles (user_id, role, user_type)
       VALUES ($1, $2, $3)`,
      [userId, defaultRole, user_type]
    );
    
    // Generate email verification token
    const verificationToken = JWTService.generateEmailVerificationToken(userId);
    
    // Store verification token in database
    await pool.query(
      `UPDATE users SET email_verification_token = $1 WHERE id = $2`,
      [verificationToken, userId]
    );
    
    // Send verification email
    try {
      await emailService.sendEmailVerification(email, verificationToken, full_name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          email: email,
          name: full_name,
          user_type: user_type,
          email_verified: false
        },
        message: "Registration successful. Please check your email to verify your account."
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Email verification endpoint
app.post("/api/auth/verify-email", rateLimiters.emailVerification, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }
    
    // Verify token
    const decoded = JWTService.verifyEmailVerificationToken(token);
    
    // Get user from database
    const result = await pool.query(
      `SELECT u.id, u.email, u.email_verification_token, p.full_name
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const user = result.rows[0];
    
    // Check if token matches
    if (user.email_verification_token !== token) {
      return res.status(400).json({ error: "Invalid verification token" });
    }
    
    // Verify email
    await pool.query(
      `UPDATE users 
       SET email_verified = true, 
           email_verification_token = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );
    
    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.full_name);
    } catch (emailError) {
      console.error('Welcome email sending failed:', emailError);
    }
    
    res.json({
      success: true,
      data: {
        message: "Email verified successfully. Welcome to Refi Wizard!"
      }
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Password reset request endpoint
app.post("/api/auth/forgot-password", rateLimiters.passwordReset, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Get user from database
    const result = await pool.query(
      `SELECT u.id, u.email, p.full_name
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        data: {
          message: "If an account with this email exists, a password reset link has been sent."
        }
      });
    }
    
    const user = result.rows[0];
    
    // Generate password reset token
    const resetToken = JWTService.generatePasswordResetToken(user.id);
    
    // Store reset token in database
    await pool.query(
      `UPDATE users 
       SET password_reset_token = $1, 
           password_reset_expires = NOW() + INTERVAL '1 hour'
       WHERE id = $2`,
      [resetToken, user.id]
    );
    
    // Send password reset email
    try {
      await emailService.sendPasswordReset(user.email, resetToken, user.full_name);
    } catch (emailError) {
      console.error('Password reset email sending failed:', emailError);
      return res.status(500).json({ error: "Failed to send password reset email" });
    }
    
    res.json({
      success: true,
      data: {
        message: "If an account with this email exists, a password reset link has been sent."
      }
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Password reset endpoint
app.post("/api/auth/reset-password", rateLimiters.passwordReset, async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    if (!token || !new_password) {
      return res.status(400).json({ error: "Token and new password are required" });
    }
    
    // Validate password strength
    if (new_password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    
    // Verify token
    const decoded = JWTService.verifyPasswordResetToken(token);
    
    // Get user from database
    const result = await pool.query(
      `SELECT id, email, password_reset_token, password_reset_expires
       FROM users WHERE id = $1`,
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const user = result.rows[0];
    
    // Check if token matches and is not expired
    if (user.password_reset_token !== token) {
      return res.status(400).json({ error: "Invalid reset token" });
    }
    
    if (new Date() > new Date(user.password_reset_expires)) {
      return res.status(400).json({ error: "Reset token has expired" });
    }
    
    // Hash new password
    const newPasswordHash = await JWTService.hashPassword(new_password);
    
    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, 
           password_reset_token = NULL,
           password_reset_expires = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [newPasswordHash, user.id]
    );
    
    res.json({
      success: true,
      data: {
        message: "Password reset successfully. You can now login with your new password."
      }
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Token refresh endpoint
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }
    
    // Verify refresh token
    const decoded = JWTService.verifyRefreshToken(refresh_token);
    
    // Check if refresh token exists in database
    const result = await pool.query(
      `SELECT us.user_id, u.email, p.full_name, p.user_type, ur.role
       FROM user_sessions us
       LEFT JOIN users u ON us.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE us.token_hash = $1 AND us.expires_at > NOW()`,
      [refresh_token]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    
    const user = result.rows[0];
    
    // Generate new access token
    const newAccessToken = JWTService.generateAccessToken({
      id: user.user_id,
      email: user.email,
      user_type: user.user_type,
      role: user.role
    });
    
    res.json({
      success: true,
      data: {
        access_token: newAccessToken,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// Logout endpoint
app.post("/api/auth/logout", authenticateUser, async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (refresh_token) {
      // Remove refresh token from database
      await pool.query(
        `DELETE FROM user_sessions WHERE token_hash = $1`,
        [refresh_token]
      );
    }
    
    res.json({
      success: true,
      data: {
        message: "Logged out successfully"
      }
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// ===== CALCULATION ENDPOINTS =====

// Debt calculations endpoint
app.post("/api/calculations/debt", authenticateUser, async (req, res) => {
  try {
    const { projectId, debtData } = req.body;
    
    // Mock calculation - in production, you'd implement actual calculations
    const calculations = {
      totalDebt: debtData.principal || 0,
      monthlyPayment: debtData.principal * 0.05 || 0, // Mock 5% rate
      interestRate: 0.05,
      term: debtData.term || 12,
      calculations: {
        principal: debtData.principal || 0,
        interest: (debtData.principal * 0.05) || 0,
        total: (debtData.principal * 1.05) || 0
      }
    };
    
    // Save calculations to database
    await pool.query(
      `INSERT INTO debt_calculations (project_id, calculations_data)
       VALUES ($1, $2)
       ON CONFLICT (project_id) DO UPDATE SET
       calculations_data = EXCLUDED.calculations_data,
       updated_at = NOW()`,
      [projectId, JSON.stringify(calculations)]
    );
    
    res.json({ success: true, data: calculations });
  } catch (error) {
    console.error("Calculation error:", error);
    res.status(500).json({ error: "Calculation failed" });
  }
});

// ===== NOTIFICATION ENDPOINTS =====

// Send notification endpoint
app.post("/api/notifications/send", authenticateUser, async (req, res) => {
  try {
    const { to, subject, message, type } = req.body;
    
    // Mock notification sending
    console.log(`Notification sent to ${to}: ${subject} - ${message}`);
    
    res.json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// ===== USER MANAGEMENT ENDPOINTS =====

// Get user profile
app.get("/api/user/profile", authenticateUser, async (req, res) => {
  try {
    // Get user profile from database
    const result = await pool.query(
      `SELECT u.id, u.email, u.email_verified, u.last_login,
              p.full_name, p.user_type, p.created_at, p.updated_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const profile = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        user_type: profile.user_type,
        email_verified: profile.email_verified,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
app.put("/api/user/profile", authenticateUser, async (req, res) => {
  try {
    const { full_name, user_type } = req.body;
    
    // Update profile in database
    await pool.query(
      `UPDATE profiles 
       SET full_name = COALESCE($1, full_name), 
           user_type = COALESCE($2, user_type),
           updated_at = NOW()
       WHERE user_id = $3`,
      [full_name, user_type, req.user.id]
    );
    
    // Get updated profile
    const result = await pool.query(
      `SELECT u.id, u.email, u.email_verified, u.last_login,
              p.full_name, p.user_type, p.created_at, p.updated_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const updatedProfile = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        full_name: updatedProfile.full_name,
        user_type: updatedProfile.user_type,
        email_verified: updatedProfile.email_verified,
        last_login: updatedProfile.last_login,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
