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

## Technology Stack
- **Frontend**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes (serverless)
- **AI Integration**: OpenAI API for information extraction
- **Data**: Mock data for demonstration (easily replaceable with real database)

## Project Structure
```
/app
  /api/openai/route.js      # OpenAI API integration
  /dashboard/page.js        # Main dashboard with metrics
  /upload/page.js           # Invoice upload and processing
  /packing-slip/[id]/page.js # Packing slip preview
  /tasks/page.js            # Task management interface
  /workflow/page.js         # Kanban-style workflow board
```

## How It Works

1. **Invoice Upload**: User uploads vendor invoice (PDF/image)
2. **AI Processing**: System extracts product details using AI
3. **Task Generation**: Automatic creation of related tasks with assignments
4. **Workflow Tracking**: Invoice moves through stages as tasks complete
5. **Packing Slip**: Clean, professional document generated for operations

## Innovation
This project demonstrates how AI can support project management by:
- Automating repetitive administrative tasks
- Creating structured workflows from unstructured data
- Assigning responsibilities and tracking progress
- Providing real-time visibility into operations

## Local Development
1. Install dependencies: `npm install`
2. Set up environment: Copy `.env.example` to `.env` and add OpenAI API key
3. Run development server: `npm run dev`
4. Access at `http://localhost:3000`

## Deployment
Ready for Vercel deployment with included `vercel.json` configuration.

## Demo Flow
1. Visit Dashboard to see overview metrics
2. Upload an invoice in Advanced Mode
3. View extracted information and generated tasks
4. Check Task Management for detailed task tracking
5. Use Workflow Board to move invoices through stages
6. Preview and print packing slips

This project showcases advanced software project management concepts including workflow automation, task assignment, progress tracking, and AI-assisted operations management.
