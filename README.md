# Makro AI – Project Management Mode

**Advanced Software Project Management Course Project**

## Project Overview

Makro AI is an AI-powered operations assistant for wholesale food distribution companies. This version extends the original application with comprehensive project management features, turning the invoice processing workflow into a structured, trackable project management system.

## Core Concept

Instead of just processing invoices, the system treats each invoice as a **mini project** with:
- Automatic task generation
- Team assignments
- Workflow stages
- Progress tracking
- Resource responsibility

## Key Features

### 1. Advanced Mode: Invoice to Packing Slip
- Upload vendor invoices (PDF or image)
- AI extracts product names, quantities, case counts, and item details
- System generates a professional, clean packing slip without prices
- Suitable for warehouse and delivery team operations

### 2. Task Assignment System
When an invoice is processed, the system automatically creates project tasks:
- **Verify received items in warehouse** → Warehouse Manager
- **Prepare packing slip** → Logistics Team
- **Schedule delivery** → Delivery Coordinator
- **Notify sales team about new arrivals** → Sales Manager

Each task includes:
- Task name and description
- Assigned team/person
- Status: Pending → In Progress → Done
- Due date and priority level

### 3. Workflow Status Tracking
Each invoice moves through project stages:
1. **Received** - Invoice uploaded and initial processing started
2. **Processing** - Items verified and packing slip generated
3. **Ready for Delivery** - Inventory updated and delivery scheduled
4. **Completed** - Delivery confirmed and all tasks done

Kanban-style board with drag-and-drop functionality for stage management.

### 4. Project Dashboard
- Real-time overview of all invoices and their stages
- Task statistics and metrics
- Recent invoice activity
- Quick access to all features

## Pages & Components

### Dashboard (`/`)
- Overview of all invoices
- Key metrics (total, completed, in processing, ready for delivery)
- Recent invoice table with quick actions
- Navigation to all features

### Upload Invoice (`/upload`)
- Vendor information input
- Product data entry with AI extraction simulation
- Add/remove products
- Professional invoice processing form

### Packing Slip Preview (`/packingslip`)
- Clean, professional packing slip design
- Product table without prices
- Printable format for warehouse use
- Auto-generated task list sidebar
- Quick action buttons

### Task Management (`/tasks`)
- Comprehensive task board
- Filter by invoice, assignee, or status
- Update task status with dropdown
- Task statistics
- Priority and due date tracking

### Workflow Tracking Board (`/workflow`)
- Kanban-style columns for each stage
- Drag-and-drop invoice cards between stages
- Visual invoice summaries
- Stage information cards

## Technology Stack

- **Framework:** Next.js 14.2.5
- **UI Library:** React 18.3.1
- **Styling:** Tailwind CSS 3.4.1
- **Backend:** Next.js API routes (optional for real implementation)
- **Data:** Mock data with React state management

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
makro_ai/
├── pages/
│   ├── index.js           # Main app with state management
│   └── _app.js            # App wrapper with layout
├── components/
│   ├── Layout.js          # Main layout wrapper
│   ├── Header.js          # Navigation header
│   ├── Dashboard.js       # Dashboard page
│   ├── InvoiceUpload.js   # Invoice upload form
│   ├── PackingSlipPreview.js  # Packing slip display
│   ├── TaskManagement.js  # Task board
│   └── WorkflowBoard.js   # Kanban workflow board
├── globals.css            # Tailwind setup
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies
```

## Demo Flow for University Presentation

1. **Open Dashboard**
   - Show key metrics and invoice overview
   - Explain the invoice-to-project concept

2. **Upload Invoice**
   - Demonstrate invoice upload form
   - Show AI data extraction simulation
   - Process a new invoice

3. **View Packing Slip**
   - Display the generated packing slip
   - Show it's ready for warehouse printing
   - Demonstrate auto-generated task list

4. **Manage Tasks**
   - Show all auto-generated tasks
   - Update task statuses
   - Explain team assignments

5. **Workflow Board**
   - Demonstrate drag-and-drop functionality
   - Move invoices between stages
   - Show visual project progress

6. **Conclusion**
   - "This system demonstrates how AI can support project management"
   - "Turns a simple invoice process into a structured workflow"
   - "Provides clear visibility and responsibility for all team members"

## Features for Presentation

✅ **Professional UI Design** - Clean, modern interface resembling business tools

✅ **Functional Demo** - All pages and features are interactive with mock data

✅ **Responsive Design** - Works on desktop, tablet, and mobile

✅ **Drag-and-Drop** - Interactive Kanban board for workflow management

✅ **Real-World Scenario** - Based on actual wholesale food distribution needs

✅ **Project Management Elements**
- Task assignment
- Status tracking
- Timeline/due dates
- Resource management
- Progress visualization

## Deployment

Ready for deployment on Vercel:

```bash
# Push to GitHub
git push

# Deploy on Vercel
# Connect your GitHub repo to Vercel dashboard
# Each push automatically deploys
```

## Future Enhancements

- Real OpenAI API integration for invoice OCR
- Backend database (MongoDB/PostgreSQL)
- User authentication and role-based access
- Real email notifications
- Payment/pricing calculations
- Reporting and analytics
- Mobile app version

## Author

**Maksatbek Yrysbaev**  
Makro AI Project – Advanced Software Project Management Course

## License

MIT License – Feel free to use this project for educational purposes.
