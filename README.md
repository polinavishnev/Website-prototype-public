# Capstone Write-up - Discearn Web App

### Introduction

This project is part of the ongoing development of the Discearn Web App, a project dedicated to improving the online learning experience. The application is designed to provide effective methods for reviewing and synthesizing information from diverse sources. Following an Agile development approach, the project is in its early stages, with ten user interviews completed. The plan is to continue with another cycle of interviews, followed by further development, ensuring that the product aligns with user needs and preferences.

### Setup

To run the project locally, clone the repository. 

You will need to add the following environment variabls to your `.env` file, in each of the `client` and `server` folders:

* `REACT_APP_API_KEY`: OpenAI API key
* `OPENAI_API_KEY`: OpenAI API key (same value as before, but named differently to be found by the OpenAI API in server.js)
* `PINECONE_ENVIRONMENT`: Pinecone environment name
* `PINECONE_API_KEY`: Pinecone API key

The OpenAI API key can be found in your [OpenAI account's API keys section](https://platform.openai.com/account/api-keys). The Pinecone environment name and API key can be found in your organization's [indexes section](https://www.app.pinecone.io).

Then, open two terminals. 

In the first terminal, navigate to the `client` folder and run `npm install` to install the dependencies. Then, run `npm run dev` to start the React app.

In the second terminal, navigate to the `server` folder and run `npm install` to install the dependencies. Then, run `npm start` to start the Node server.

The web app should now be running on `localhost:3000`.


### Project Structure

Most notable files and folders:

> client: React frontend to display the web app to the user
- `src`: Contains the source code for the React application
    - `components`: Contains the React components used to build the web app
        - `Card.jsx`: Component to display the question and answer
        - `Chat.jsx`: Component to display the discussion with feedback
        - `PDFViewer.jsx` : Component to view an uploaded PDF file. Currently not enabled
        - `Upload.jsx`: Component to upload copy-pasted text into Pinecone
    - `App.jsx`: Main component to render the web app
> server: Node backend to run the server allowing connection to Pinecone vector database
- `server.js` : Runs the server
- `cleanup.js` : Wipes the Pinecone database


[Link to Loom Demo](https://www.loom.com/share/618f2fb368424a68b3847fb71ab52fad?sid=9a54773f-cea3-4096-b764-9b5d15bcbfd9) | [Link to Prototype](https://website-prototype-production-cb4c.up.railway.app/)
