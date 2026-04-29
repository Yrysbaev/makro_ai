# Makro AI – Project Management Mode

## Project Overview
Makro AI is an AI-powered operations assistant for a wholesale food distribution company. This advanced version extends the original invoice processing system with comprehensive project management features, turning each invoice into a structured workflow with task assignment and progress tracking.

## Key Features

### 1. Advanced Mode: Invoice to Packing Slip
- Upload vendor invoices (PDF or image format)
- AI extracts product information, quantities, and case counts
- Generates clean, professional packing slips without pricing information
- Optimized for warehouse and delivery team use

### 2. Task Assignment System
After invoice processing, the system automatically creates project tasks:
- Verify received items in warehouse
- Prepare packing slip
- Schedule delivery
- Notify sales team about new arrivals

Each task includes:
- Task name and description
- Assigned team member/person
- Current status (Pending, In Progress, Done)
- Due date or estimated completion time

### 3. Workflow Status Tracking
Each invoice becomes a mini-project with defined stages:
- **Received**: Invoice uploaded and initial processing
- **Processing**: Information extraction and task assignment
- **Ready for Delivery**: All tasks completed, packing slip prepared
- **Completed**: Delivery scheduled and confirmed

### 4. AI Assistant Box
- Chat-like interface for business queries
- Generate marketing copy, emails, and product descriptions
- Summarize documents and invoices
- Mock ChatGPT responses for demonstration

## Technology Stack
- **Frontend**: Next.js 14 with React
- **Styling**: Tailwind CSS 3.4+
- **Backend**: Next.js API routes (serverless)
- **AI Integration**: OpenAI API for information extraction
- **Data**: Mock data for demonstration (easily replaceable with real database)

## Project Structure
```
/app
  /api/openai/route.js      # OpenAI API integration
  /page.js                  # Dashboard with AI Assistant box
  /advanced/page.js         # Invoice upload and packing slip
  /workflow/page.js         # Kanban-style workflow board
  /tasks/page.js            # Task management interface
  /upload/page.js           # Legacy upload mode
  /packing-slip/[id]/page.js # Packing slip preview
  /globals.css              # Global styles with custom components
```

## How It Works

1. **AI Assistant**: Ask questions, generate content, get business insights
2. **Invoice Upload**: User uploads vendor invoice (PDF/image)
3. **AI Processing**: System extracts product details using AI
4. **Task Generation**: Automatic creation of related tasks with assignments
5. **Workflow Tracking**: Invoice moves through stages as tasks complete
6. **Packing Slip**: Clean, professional document generated for operations

## Innovation
This project demonstrates how AI can support project management by:
- Automating repetitive administrative tasks
- Creating structured workflows from unstructured data
- Assigning responsibilities and tracking progress
- Providing real-time visibility into operations
- Combining ChatGPT-style assistance with business operations

## Local Development
1. Install dependencies: `npm install`
2. Set up environment: Copy `.env.example` to `.env` and add OpenAI API key
3. Run development server: `npm run dev`
4. Access at `http://localhost:3000`

## Build
```bash
npm run build
```

## Deployment
Ready for Vercel deployment with included `vercel.json` configuration.

## Demo Flow
1. Visit Dashboard to see metrics and use AI Assistant
2. Try example prompts: "Write supplier email", "Summarize invoice"
3. Go to Advanced Mode to upload an invoice
4. View extracted information and generated tasks
5. Check Task Management for detailed tracking
6. Use Workflow Board (Kanban) to move invoices through stages
7. Preview and print packing slips

## Course Project
This project showcases advanced software project management concepts including:
- Workflow automation
- Task assignment and tracking
- Progress visualization (Kanban boards)
- AI-assisted operations management
- Real-time project status monitoring
- Professional business tool design

Developed for Advanced Software Project Management course at university.

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
>>>>>>> 488f425f106bd094cf9d8e60944f71dbadae92a1
