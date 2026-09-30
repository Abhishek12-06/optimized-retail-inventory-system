# Optimized Retail and Inventory Management System

## 1. Project Overview

This is a college/HCL project called:

Optimized Retail and Inventory Management System

The goal is to build a practical retail inventory management platform that helps businesses manage products, stock, suppliers, purchases, sales, users, reports, and inventory optimization.

The system should be designed so that it can later be extended into a larger SaaS-style inventory platform.

---

## 2. Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Recharts
- Tailwind CSS

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MongoDB
- Mongoose
- MongoDB Atlas

### Authentication
- JWT
- bcryptjs

### Development Tools
- VS Code
- Git
- GitHub
- Postman

### DevOps
- Docker
- GitHub Actions
- AWS

### Future ML Service
- Python
- FastAPI
- pandas
- NumPy
- scikit-learn

---

## 3. Main Architecture

The main application architecture is:

React Frontend
        ↓
Axios
        ↓
Express REST API
        ↓
Controllers
        ↓
Services
        ↓
Mongoose
        ↓
MongoDB

Future ML architecture:

Node.js Backend
        ↓
Python FastAPI ML Service
        ↓
Demand Forecast
        ↓
Node.js Backend
        ↓
React Frontend

---

## 4. Main Modules

The system should contain the following major modules:

1. Authentication
2. User Management
3. Role Management
4. Products
5. Categories
6. Suppliers
7. Inventory
8. Stock Transactions
9. Sales
10. Purchase Orders
11. Dashboard
12. Reports
13. Notifications
14. Inventory Optimization
15. Demand Forecasting
16. Analytics

---

## 5. User Roles

### Admin

- Manage users
- Manage products
- Manage categories
- Manage suppliers
- View inventory
- View sales
- View purchase orders
- View reports
- View analytics
- Manage system settings

### Inventory Manager

- Manage inventory
- Record stock movements
- Manage suppliers
- Create purchase orders
- Monitor low stock
- View optimization recommendations
- View inventory reports

### Sales Staff

- View products
- Record sales
- View available stock
- View sales-related information

Role-based access control must be implemented on the backend.

---

## 6. Inventory Optimization

The system should eventually provide inventory optimization features.

### Reorder Point

Reorder Point = Average Daily Demand × Lead Time + Safety Stock

The system should identify products that need replenishment.

### Economic Order Quantity

EOQ = sqrt((2 × D × S) / H)

Where:

- D = Annual Demand
- S = Ordering Cost
- H = Holding Cost per unit per year

### ABC Analysis

Products should be classified into:

- A
- B
- C

based on their contribution to inventory value.

### Stock Classification

The system may classify inventory as:

- Fast-moving
- Normal-moving
- Slow-moving
- Dead stock
- Overstocked
- Low stock

### Stock Coverage

The system should calculate approximately how many days the current stock can satisfy expected demand.

---

## 7. Demand Forecasting

Demand forecasting is an advanced/future feature.

Do not implement complex machine learning before the core inventory system is working.

The future ML service may use:

- Python
- FastAPI
- pandas
- NumPy
- scikit-learn

The ML service may predict future product demand using historical sales data.

---

## 8. Backend Structure

The backend should follow a clean layered architecture.

Example:

backend/
    src/
        config/
        controllers/
        middleware/
        models/
        routes/
        services/
        utils/
        validators/
        app.js
        server.js

Business logic should preferably be placed inside service files rather than putting everything inside controllers.

---

## 9. Frontend Structure

The frontend should use reusable React components.

Example:

frontend/
    src/
        components/
        layouts/
        pages/
        services/
        hooks/
        context/
        routes/
        utils/

Avoid creating duplicate components.

Use reusable components wherever practical.

---

## 10. Development Rules

Claude must follow these rules when working on this project:

1. Inspect existing files before modifying them.
2. Do not rewrite working code unnecessarily.
3. Do not create duplicate files or duplicate components.
4. Keep frontend and backend clearly separated.
5. Use environment variables for secrets and configuration.
6. Never commit real secrets, passwords, API keys, or database credentials.
7. Never expose MongoDB credentials in frontend code.
8. Use proper validation for API inputs.
9. Use centralized error handling in the backend.
10. Keep business logic in service layers where practical.
11. Use REST API conventions.
12. Keep code readable and beginner-friendly.
13. Prefer reusable React components.
14. Do not implement advanced AI/ML before the core system works.
15. Do not introduce unnecessary dependencies.
16. Explain important architectural decisions.
17. Preserve existing functionality when adding new features.
18. Test changes before declaring them complete.

---

## 11. Security Rules

The application should follow basic security practices.

- Passwords must be hashed using bcryptjs.
- Authentication should use JWT.
- Sensitive configuration must be stored in environment variables.
- .env files must not be committed.
- Validate incoming API data.
- Use Helmet.
- Configure CORS properly.
- Do not expose stack traces in production.
- Protect authenticated routes.
- Implement role-based authorization.

---

## 12. Git Rules

Use meaningful commits.

Examples:

feat: add authentication
feat: add product management
feat: add inventory module
feat: add sales module
feat: add supplier management
feat: add reorder point calculation
fix: correct stock calculation
docs: update architecture documentation
chore: configure backend

Do not make huge unrelated commits when smaller logical commits are possible.

---

## 13. Development Order

Build the system in this approximate order:

1. Project structure
2. Backend foundation
3. MongoDB connection
4. Authentication
5. Users and roles
6. Categories
7. Products
8. Suppliers
9. Inventory
10. Stock transactions
11. Sales
12. Purchase orders
13. Dashboard APIs
14. React frontend foundation
15. Frontend authentication
16. Dashboard UI
17. Products UI
18. Inventory UI
19. Sales UI
20. Supplier UI
21. Purchase order UI
22. Inventory optimization
23. Notifications
24. Reports
25. Demand forecasting
26. Testing
27. Security review
28. Docker
29. GitHub Actions
30. AWS deployment

---

## 14. Important Working Principle

Do not try to build the entire project at once.

Work module by module.

Before moving to the next major module:

- Make sure the current code works.
- Test the API.
- Check the frontend.
- Fix errors.
- Keep the code organized.
- Commit the working version.

---

## 15. When Making Changes

Before modifying code:

1. Inspect relevant existing files.
2. Understand the current implementation.
3. Identify dependencies.
4. Make the smallest reasonable change.
5. Test the change.
6. Explain what was changed.

After completing a task, report:

- Files created
- Files modified
- Important changes
- Commands that need to be run
- Environment variables required
- Tests performed
- Any remaining issues

---

## 16. Project Quality Goal

This should not be treated as a simple CRUD college project.

The goal is to build a clean, practical, scalable inventory management application demonstrating:

- Full-stack development
- REST API design
- Database design
- Authentication
- Role-based authorization
- Inventory management
- Business logic
- Inventory optimization
- Data visualization
- Basic analytics
- Future ML integration
- Docker
- CI/CD
- Cloud deployment

Keep the implementation realistic and understandable for a college project while following professional software development practices.