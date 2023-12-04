const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { Pinecone } = require("@pinecone-database/pinecone");
const express = require("express");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAI } = require("langchain/llms/openai");
const { VectorDBQAChain } = require("langchain/chains");
require("dotenv").config();

// Create Express app
const app = express();
const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;
const CLIENT_URL =
  process.env.NODE_ENV === "production"
    ? "https://website-prototype-production-cb4c.up.railway.app"
    : "http://localhost:3000";

// Initialize Pinecone client
const pineconeClient = new Pinecone({
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
});

// Create Pinecone index
const index = pineconeClient.index("app");
const openai = new OpenAI({
  openAIApiKey: process.env.REACT_APP_API_KEY,
  maxTokens: 500,
});

// Initialize text splitter and embedder
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 0,
});
const embedder = new OpenAIEmbeddings({ openAIApiKey: REACT_APP_API_KEY });

// Create Pinecone store instance
const pineconeStore = new PineconeStore(embedder, {
  pineconeIndex: index,
  namespace: "langchain",
});

// Middleware to parse JSON in requests
app.use(express.json());
const cors = require("cors");
app.use(
  cors({
    origin: CLIENT_URL,
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  next();
});

// Route to handle text upload and Pinecone indexing
app.post("/upload", async (req, res) => {
  try {
    console.log("Request received:", req.body);
    const { text } = req.body;

    // Perform text splitting or any other processing here if needed
    const splittedText = await textSplitter.createDocuments([text]);
    const pineconeStoreData = await splittedText.map(
      (text) => text.pageContent
    );

    // Upload the split text to Pinecone
    await PineconeStore.fromTexts(pineconeStoreData, null, embedder, {
      pineconeIndex: index,
      namespace: "langchain",
    });
    res.status(200).send("Text uploaded to Pinecone successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/search", async (req, res) => {
  try {
    console.log("Request received:", req.query);
    const text = req.query.text;

    const vectorStore = await PineconeStore.fromExistingIndex(embedder, {
      pineconeIndex: index,
      namespace: "langchain",
    });

    /* Search the vector DB independently with meta filters */
    const results = await vectorStore.similaritySearch(text, 5);
    console.log(results);
    res.status(200).send([...results]);
  } catch (error) {
    console.error(error);
  }
});

const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
