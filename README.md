# Makro AI Assistant Dashboard

## Project Title
Makro AI Assistant – Business Automation System

## Project Description
Makro AI Assistant is a multi-functional AI-powered dashboard designed to automate key business operations such as product marketing, communication, and customer support. The system uses role-based AI modules to simulate different departments like sales, marketing, and support, helping businesses save time and improve efficiency.

## Project Objectives
- Automate repetitive business tasks
- Improve communication quality
- Generate marketing content instantly
- Support customer interaction
- Provide structured business insights

## System Features
1. Product Generator
   - Generates description, selling points, target audience, SEO keywords
   - Simulates a marketing department AI
2. Email Writer
   - Creates professional emails instantly
   - Simulates a sales department AI
3. Caption Generator
   - Generates Instagram captions and hashtags
   - Simulates a social media manager AI
4. Text Summarizer
   - Converts long text into short structured summaries
   - Simulates an analyst AI
5. Customer Reply Generator
   - Generates polite, professional responses
   - Simulates a customer support AI

## System Architecture
Simple version:
- Frontend: Next.js React application
- AI API: OpenAI via a secure server-side API route
- Prompt-based logic for role specialization

## Technologies Used
- Next.js
- React
- HTML
- CSS
- OpenAI API

## How It Works
1. User inputs data
2. System selects AI module
3. Prompt is generated based on role
4. AI processes input via OpenAI
5. Structured business output is displayed

## Innovation
Instead of using a single general AI, this system uses role-based prompt engineering to simulate real business departments, making the outputs more specialized and practical.

## Demo Flow
1. Open the dashboard
2. Use Product Generator with "Turkish Baklava"
3. Use Email Writer with "Ask supplier for price list"
4. Use Customer Reply Generator with "Customer complains about late delivery"
5. Conclude: "This system helps businesses automate daily operations using AI"

## Local Setup
1. Install dependencies:
   - `npm install`
2. Copy `.env.example` to `.env`
3. Set `OPENAI_API_KEY=your_openai_api_key_here` in `.env`
4. Run the app locally:
   - `npm run dev`
5. Open the dashboard in your browser at `http://localhost:3000`

> The app now uses Next.js with a server-side API route so the OpenAI API key stays off the browser and out of source control.

## Deployment
This project is ready for deployment on Vercel.

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Configure an environment variable:
   - `OPENAI_API_KEY`
4. Deploy the app.

The app will run as a Next.js site and use the secure server-side API route to call OpenAI.

## Final Touch
The app title has been updated to "Makro AI Assistant – Business Automation System".
