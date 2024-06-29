# PineappleStudios

Software Engineering Group 2 for SCSG

## Video Walkthrough
https://www.youtube.com/watch?v=W-0Sp5LloUM

## Get Started

Find the instructions in `./docs/get_started/README.md`

## Commands you often use

> On Windows Powershell, there maybe some errors with pnpm, then you just use npm as well.

```sh
git add <files>
git push
git fetch
git pull

fnm use           # to use the current node version

# On Windows Powershell, there maybe some errors with pnpm, then you just use npm as well.

pnpm install      # install dependencies
pnpm i            # short for pnpm install

# if you are using npm, you need to use npm run.
#   npm run dev
#   npm run format:lint
# etc.

pnpm dev          # starting a dev server
pnpm build        # build for production
pnpm start        # preview for production
pnpm format       # formatting code
pnpm lint         # linting code
pnpm format:lint  # formatting and linting code

# Or for npm

npm install

npm run dev
npm run build
npm run start
npm run format
npm run lint
npm run foramt:lint
```

## Folder explanation

```
.
├── docs                     # Docs for development
├── prisma                   # prisma schema and migrations
├── public                   # static assets
├─ recommendation_engine     # AI
└── src                      # source folder
    ├── app                  # app directory
    │   └── routes           # routes
    │       └── _components  # components
    └─── lib                 # lib directory
        ├── database         # database
        └── dataRetrieve     # database and UI communication
```

## Starting Recommendation engine

Head over to recommendation_engine file for the server and scripts

```
.
│
...
├── recommendation_engine       # directory containing all essential files for recommendation system to function
│   ├── Recommendation_System.py
│   ├── Recommendation_System_server.py
│   ├── .env file
│   ├── requirements.txt
│   └── .joblib files and .pkl files in google drive link (must be loaded into the same directory where the  Recommendation_System.py, Recommendation_System_server.py and .env files are located)
```

ues google drive link for .joblib files and .pkl files

### To run server

first navigate to the recommendation_engine directory

```
pip install -r requirements.txt
python Recommendation_System_server.py
```

## Check out the links

- `prisma`: [Prisma with Remix](https://github.com/prisma/prisma-examples/tree/latest/typescript/remix)
  - `schema.prisma`: [Prisma Schema](https://www.prisma.io/docs/getting-started/quickstart#2-model-your-data-in-the-prisma-schema)
- `public`
- `src`
  - `app`
    - `routes`: (folder) [Routes Naming](https://remix.run/docs/en/main/file-conventions/routes)
      - `components`: [React Components](https://react.dev/learn/your-first-component)
    - `entry.client.tsx`: [Client Entry](https://remix.run/docs/en/main/file-conventions/entry.client)
    - `entry.server.tsx`: [Server Entry](https://remix.run/docs/en/main/file-conventions/entry.server)
    - `root.tsx`: [Root Route](https://remix.run/docs/en/main/file-conventions/root)
    - `tailwind.css`: [Tailwind entry](https://remix.run/docs/en/main/styling/tailwind)
  - `database`: [Prisma with Remix](https://github.com/prisma/prisma-examples/tree/latest/typescript/remix)
- `package.json`
- `PineappleStudios.code-workspace`
- `production.env`: [Check out paragraph 3: Because the SQLite...](https://www.prisma.io/docs/getting-started/quickstart#3-run-a-migration-to-create-your-database-tables-with-prisma-migrate)
- `README.md`
- `remix.config.js`: [Remix Config](https://remix.run/docs/en/main/file-conventions/remix-config)
- `remix.env.d.ts`
- `tailwind.config.ts`: [Tailwind Configuration](https://tailwindcss.com/docs/configuration)
- `tsconfig.json`: [tsconfig](https://www.typescriptlang.org/tsconfig)

## Technologies we are using

- `Remix.run`: Full stack framework
  - Website: [Remix.run](https://remix.run/)
  - Learn it at:
    - [Quick Start](https://remix.run/docs/en/main/start/quickstart)
    - [Tutorial](https://remix.run/docs/en/main/start/tutorial)
- `React`: UI Framework
  - Website: [React.dev](https://react.dev/)
  - Learn it at:
    - [Quick Start](https://react.dev/learn)
    - [Tic-Tac-Toe](https://react.dev/learn/tutorial-tic-tac-toe)
  - It may be confusing what is the relationship between React and Remix.run, to be simple: React is the UI part(HTML + CSS + some interactions with UI); Remix.run is full stack, which provides server, routing, data fetch, etc.
- `TailwindCSS`: CSS framework
  - Website: [Tailwindcss.com](https://tailwindcss.com/)
- `DaisyUI`: UI components library
  - Website: [DaisyUI.com](https://daisyui.com/)
  - Tutorial:
    - [How to use](https://daisyui.com/docs/use/)
  - This library is based on TailwindCSS, so that means we can use its components with original TailwindCSS.
  - What you need to know: in `.jsx/tsx`, it is `className` instead of `class`
- `Prisma`: For database, and ORM
  - Website: [Prisma.io](https://www.prisma.io/)
  - Learn it at:
    - [Quick Start](https://www.prisma.io/docs/getting-started/quickstart)
    - [Prisma with Remix](https://github.com/prisma/prisma-examples/tree/latest/typescript/remix)
    - [Tutorial](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql)
      - This tutorial is based on postgresql, but the main concept is the same.
  - `sqlite`: We are using sqlite database, because it is just a file, need no outside database server.
    - More info at: [Prima + sqlite](https://www.prisma.io/docs/orm/overview/databases/sqlite)
  - Create a file called `.env`, write `DATABASE_URL="file:./dev.db"`.
  - For now(Feb 2nd), `prisma` is just initialized, but not using in the codebase, because we are not yet implemented our database schema yet.

# Documentation for using Recommendation System

### Overview

This Flask server ( Recommendation_System_server.py ) provides endpoints for generating recommendations based on media content (books, movies, songs). The recommendations can be generated using three methods:

1. `GET /recommend/llm`: Uses a large language model to suggest similar media based on a given title.
2. `GET /recommend/content`: Provides content-based recommendations using TF-IDF, cosine-similarity and nearest neighbor techniques.
3. `GET /recommend/combined`: Combines the results from both the LLM and content-based methods, shuffles them, and provides a diverse set of recommendations.

### Setting up the TypeScript Application

To use these endpoints, your TypeScript application will need to handle HTTP requests and parse JSON responses. Here's how we can set up a simple TypeScript environment that interacts with the Flask server.

#### Prerequisites

- Node.js installed on your system.
- A TypeScript project setup. You can initialize one using `npm init` and `tsc --init` commands.

#### Dependencies

You'll need to install `axios` for making HTTP requests, and `dotenv` for managing environment variables.

```bash
npm install axios dotenv
```

#### Configuration

Create a `.env` file in your project's root directory to store your Flask server's URL:

```plaintext
# .env file
SERVER_URL=http://localhost:5000
```

### TypeScript Implementation

Below is a sample implementation that demonstrates how to interact with the Flask server's endpoints.

#### Setup Axios and Environment Variables

Create a new file `api.ts`:

```typescript
import axios from "axios";
import {config} from "dotenv";

// Load environment variables
config();

const serverUrl = process.env.SERVER_URL;

const apiClient = axios.create({
  baseURL: serverUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
```

#### Create Functions to Call the Endpoints

In the same or a new file, create functions to interact with each API endpoint:

```typescript
import apiClient from "./api";

// Define types for the recommendation results
type RecommendationResult = {
  books: string[];
  movies: string[];
  songs: string[];
};

// Function to get LLM recommendations
export async function getLLMRecommendations(
  mediaName: string,
): Promise<RecommendationResult> {
  try {
    const response = await apiClient.post("/recommend/llm", {
      media_name: mediaName,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching LLM recommendations:", error);
    throw error;
  }
}

// Function to get content-based recommendations
export async function getContentRecommendations(
  mediaName: string,
): Promise<RecommendationResult> {
  try {
    const response = await apiClient.post("/recommend/content", {
      media_name: mediaName,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching content recommendations:", error);
    throw error;
  }
}

// Function to get combined recommendations
export async function getCombinedRecommendations(
  mediaName: string,
): Promise<RecommendationResult> {
  try {
    const response = await apiClient.post("/recommend/combined", {
      media_name: mediaName,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching combined recommendations:", error);
    throw error;
  }
}
```

#### Usage

These functions can be used in any part of the TypeScript application to retrieve recommendations. Here is an example :

```typescript
import {
  getCombinedRecommendations,
  getContentRecommendations,
  getLLMRecommendations,
} from "./api";

async function displayRecommendations() {
  const mediaName = "The Matrix";
  console.log(`Fetching recommendations for: ${mediaName}`);

  const llmRecommendations = await getLLMRecommendations(mediaName);
  console.log("LLM Recommendations:", llmRecommendations);

  const contentRecommendations = await getContentRecommendations(mediaName);
  console.log("Content-Based Recommendations:", contentRecommendations);

  const combinedRecommendations = await getCombinedRecommendations(mediaName);
  console.log("Combined Recommendations:", combinedRecommendations);
}

displayRecommendations();
```
