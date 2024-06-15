const { Pinecone } = require('@pinecone-database/pinecone');

require("dotenv").config();

// Initialize the Pinecone client
const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT
});

// Choose the appropriate Pinecone index
const index = pineconeClient.index("app");

// Clear all from the index
index.deleteAll();
