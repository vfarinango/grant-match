# GrantMatch 
GrantMatch is a full-stack application designed to help users find relevant grant opportunities using AI-powered natural language search. The app provides a user-friendly dashboard where individuals and organizations can search for grants by describing their needs in plain language, discover similar opportunities, and get AI-generated summaries of grant descriptions.

Features
Natural Language Search: Find grants by describing your needs in detail, powered by OpenAI's embedding model and PostgreSQL's pgvector for semantic search.

Search Similar: Discover grants that are semantically similar to a specific grant, allowing for deeper exploration of funding opportunities.

AI-Powered Summaries: Get concise, AI-generated summaries of long grant descriptions with a single click, using the OpenAI Chat Completions API.

Dashboard Layout: The application features a dashboard layout built with Mantine and a custom design library.

Data Pipeline: A robust ETL (Extract, Transform, Load) script handles the ingestion of real grant data from external APIs.

Tech Stack
Backend: Node.js, Express.js, TypeScript, PostgreSQL, pgvector, OpenAI API, Grants.gov API.

Frontend: React, Vite, Mantine, TypeScript, Tailwind CSS.

# Getting Started
Follow these instructions to set up and run the project on your local machine.

## Prerequisites
1. Node.js (LTS version) and npm
2. PostgreSQL
3. pgvector extension installed on your PostgreSQL server


## Installation
1. Clone the repository: git clone https://github.com/vfarinango/grant-match.git
    terminal command: cd grant-match
3. Install backend dependencies: (/backend) npm install
4. Install frontend dependencies: (/frontend) npm install

## Database Setup & Data Ingestion
Create local databases:
1. Using psql or a database client, create two new databases for development and testing.
    psql command: CREATE DATABASE grant_match_development;
2. Configure environment variables:
   In your backend directory, create a .env file and add your database and OpenAI API credentials.

   (For local database)
   - PG_USER=your_username
   - PG_HOST=localhost
   - PG_DATABASE=grant_match_development
   - PG_PASSWORD=your_password
   - PG_PORT=5432
   
   (OpenAI Key)
   - OPENAI_API_KEY=your_openai_api_key

## Run the application and trigger the ETL
From your backend directory, start the server in development mode.
terminal command: npm run dev

In a new terminal window, trigger the ETL pipeline by making a POST request to the new endpoint. This will automatically set up your database and populate it with real grants.
terminal command: curl -X POST http://localhost:8000/api/etl/run

In a third terminal window, navigate to your frontend directory and start the Vite server.
terminal command: cd ../frontend
terminal command: npm run dev

Your application will be available at http://localhost:5173

✨
