const express = require("express");
const cors = require("cors");
const { requestLogger, errorLogger } = require("./services/logger");
const { errorHandler } = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: [
    'https://frontend-ck6f73nl9l.dcdeploy.cloud',
    'https://modelmywealth.dcdeploy.cloud',
    'http://localhost:8080',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json());

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    database: "PostgreSQL", 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/projects", require("./routes/companyRoutes")); // Company-specific routes
app.use("/api/projects", require("./routes/profitLossRoutes")); // Profit & Loss routes
app.use("/api/balance-sheet", require("./routes/balanceSheetRoutes")); // Balance Sheet routes
app.use("/api/debt-structure", require("./routes/debtStructureRoutes")); // Debt Structure routes
app.use("/api/growth-assumptions", require("./routes/growthAssumptionsRoutes")); // Growth Assumptions routes
app.use("/api/working-capital", require("./routes/workingCapitalRoutes")); // Working Capital routes
app.use("/api/seasonality", require("./routes/seasonalityRoutes")); // Seasonality routes
app.use("/api/cash-flow", require("./routes/cashFlowRoutes")); // Cash Flow routes
app.use("/api/debt-calculation", require("./routes/debtCalculationRoutes")); // Debt Calculation routes
app.use("/api/depreciation-schedule", require("./routes/depreciationScheduleRoutes"));
app.use("/api/consolidated", require("./routes/consolidatedRoutes")); // Consolidated routes
app.use("/api/kpi", require("./routes/kpiRoutes")); // KPI routes
app.use("/api", require("./routes/autoSaveRoutes"));
app.use("/api", require("./routes/calculationPersistenceRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

// Error logging
app.use(errorLogger);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Logging level: ${process.env.LOG_LEVEL || 'info'}`);
});

module.exports = app; 