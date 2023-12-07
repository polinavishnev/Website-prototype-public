const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize the Pinecone client
const pineconeClient = new Pinecone({
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
});

// Choose the appropriate Pinecone index
const index = pineconeClient.index("app");

// Clear all from the index
index.deleteAll();
