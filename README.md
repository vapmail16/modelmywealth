# ModelMyWealth - Financial Wizard Application

A comprehensive financial modeling and analysis application built with React, Node.js, and PostgreSQL. This application provides advanced financial calculations, interactive charts, and data visualization for financial analysis and planning.

## 🚀 Features

### Core Functionality
- **Interactive Data Entry** - Comprehensive forms for financial data input
- **Real-time Calculations** - Advanced financial calculations with history tracking
- **Interactive Charts** - 9 different financial charts with data period selection
- **KPI Dashboard** - Key Performance Indicators with automated calculations
- **Consolidated Financial Statements** - Monthly, Quarterly, and Yearly statements

### Financial Calculations
- **Debt Amortization Schedules** - Complete debt calculation with history tracking
- **Depreciation Schedules** - 120-month straight-line depreciation
- **Consolidated Financial Statements** - P&L, Balance Sheet, Cash Flow
- **KPI Calculations** - DSCR, Debt to EBITDA, Interest Coverage, etc.

### Charts & Visualizations
1. **Debt to EBITDA & DSCR** - Dual Y-axis line chart
2. **LTV and Interest Coverage Ratio** - Dual Y-axis line chart
3. **Debt to Equity Ratio & Operating Margin** - Dual Y-axis line chart
4. **Revenue and EBITDA** - Bar chart
5. **Outstanding Debt Balance and Interest Paid** - Combined bar/line chart
6. **Cash, PPE and Total Equity Balance** - Combined bar/line chart
7. **Profitability Ratios as % of Revenue** - Line chart
8. **AR and Inventory Cycle Days** - Combined bar/line chart
9. **Key Ratios Overview** - Combined bar/line chart

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Shadcn UI** for components
- **Chart.js** with react-chartjs-2 for visualizations
- **React Router** for navigation
- **Zustand** for state management

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **Python** scripts for complex financial calculations
- **Winston** logging

### Key Libraries
- **numpy_financial** for financial calculations
- **pandas** for data manipulation
- **psycopg2** for PostgreSQL connectivity

## 📁 Project Structure

```
refi-wizard-postgresql/
├── api-server/                 # Backend Node.js server
│   ├── controllers/            # API controllers
│   ├── services/              # Business logic
│   ├── repositories/          # Data access layer
│   ├── routes/                # API routes
│   ├── scripts/               # Python calculation scripts
│   └── server.js              # Main server file
├── src/                       # Frontend React application
│   ├── components/            # React components
│   │   ├── charts/           # Chart components
│   │   ├── forms/            # Data entry forms
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page components
│   ├── services/             # API services
│   └── types/                # TypeScript type definitions
├── archive/                   # Archived files
└── project_documentation/     # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vapmail16/modelmywealth.git
   cd modelmywealth
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd api-server
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Frontend (.env)
   VITE_API_BASE_URL=http://localhost:3001/api
   
   # Backend (api-server/.env)
   DATABASE_URL=postgresql://username:password@localhost:5432/modelmywealth
   JWT_SECRET=your-secret-key
   PORT=3001
   ```

5. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE modelmywealth;
   ```

6. **Run database migrations**
   ```bash
   cd api-server
   psql -d modelmywealth -f migrations/add_audit_and_calculation_tables.sql
   ```

7. **Start the backend server**
   ```bash
   cd api-server
   npm start
   ```

8. **Start the frontend development server**
   ```bash
   npm run dev
   ```

9. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

## 📊 Features Overview

### Data Entry Forms
- **Profit & Loss** - Revenue, COGS, Operating Expenses, Depreciation, Interest, Tax
- **Balance Sheet** - Cash, AR, Inventory, PPE, Debt, Equity, Retained Earnings
- **Debt Structure** - Senior Secured, Short Term Debt with rates and terms
- **Growth Assumptions** - Revenue growth, Capex, working capital ratios
- **Working Capital** - AR, Inventory, AP cycles

### Calculation Engine
- **Debt Calculations** - Amortization schedules with history tracking
- **Depreciation Schedule** - 120-month straight-line depreciation
- **Consolidated Financial Statements** - Monthly, Quarterly, Yearly
- **KPI Dashboard** - All financial ratios (DSCR, Debt to EBITDA, etc.)

### Charts & Analytics
- **9 Interactive Charts** - All charts from the original Streamlit application
- **Data Period Selection** - Monthly, Quarterly, Yearly data views
- **Real-time Updates** - Charts update automatically with new data
- **Export Capabilities** - Chart export functionality (planned)

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

#### Backend (api-server/.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/modelmywealth
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
```

### Database Setup
The application uses PostgreSQL with the following key tables:
- `users` - User authentication
- `projects` - Project management
- `calculation_runs` - Calculation history tracking
- `balance_sheet_data` - Balance sheet data
- `profit_loss_data` - P&L data
- `debt_calculations` - Debt amortization schedules
- `depreciation_schedule` - Depreciation calculations
- `consolidated_*` - Monthly, quarterly, yearly consolidated statements
- `kpi_*` - KPI calculations for different periods

## 🧪 Testing

### Backend Tests
```bash
cd api-server
npm test
```

### Frontend Tests
```bash
npm test
```

## 📈 Roadmap

### MVP Features (Completed ✅)
- ✅ Interactive data entry forms
- ✅ Real-time financial calculations
- ✅ 9 interactive charts
- ✅ KPI dashboard
- ✅ Data period selection
- ✅ History tracking
- ✅ Authentication system

### Future Enhancements (Planned 🔄)
- 🔄 AI-powered report generation (Gemini API)
- 🔄 Chart export functionality
- 🔄 Interactive filters and date ranges
- 🔄 Real-time collaborative editing
- 🔄 Advanced scenario analysis
- 🔄 PDF report generation
- 🔄 Peer benchmarking
- 🔄 Covenant testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by financial modeling best practices
- Charts implementation based on Chart.js
- UI components from Shadcn UI

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: vapmail16@gmail.com

---

**ModelMyWealth** - Empowering financial analysis and decision-making through advanced modeling and visualization tools. 
this is to do smaple commit