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

Prerequisites
Node.js (LTS version) and npm

PostgreSQL

pgvector extension installed on your PostgreSQL server


Installation
1. Clone the repository:
   git clone https://github.com/vfarinango/grant-match.git
   cd grant-match
2. Install backend dependencies: (/backend) npm install
3. Install frontend dependencies: (/frontend) npm install

Database Setup & Data Ingestion
1. Create local databases:
2. Using psql or a database client, create two new databases for development and testing.
    CREATE DATABASE grant_match_development;
3. Configure environment variables:
   In your backend directory, create a .env file and add your database and OpenAI API credentials.
   
