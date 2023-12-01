const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const express = require('express');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAI } = require('langchain/llms/openai');
const { VectorDBQAChain } = require('langchain/chains');


// Create Express app
const app = express();

// Initialize Pinecone client
const pineconeClient = new Pinecone({
  environment: "asia-southeast1-gcp-free",
  apiKey: "4ef75cc4-ec07-4947-9258-247854b25a28"
});

// Create Pinecone index
const index = pineconeClient.index("app");
const openai = new OpenAI({
  openAIApiKey: "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" ,
  maxTokens: 500,
});


index.deleteAll();
