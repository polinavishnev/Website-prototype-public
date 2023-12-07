# Capstone Write-up - Discearn Web App

### Introduction

This project is part of the ongoing development of the Discearn Web App, a project dedicated to improving the online learning experience. The application is designed to provide effective methods for reviewing and synthesizing information from diverse sources. Following an Agile development approach, the project is in its early stages, with ten user interviews completed. The plan is to continue with another cycle of interviews, followed by further development, ensuring that the product aligns with user needs and preferences.


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


[Link to Loom Demo](https://www.loom.com/share/c8b3df037a3842ac8ae8a1cb5bd4f684) | [Link to Prototype](https://website-prototype-3.onrender.com/)
