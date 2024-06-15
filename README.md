# Senior Thesis README.md - Discearn Web App

### Introduction

This project is part of the ongoing development of the Discearn Web App, a project dedicated to improving the online learning experience. The application is designed to provide effective methods for reviewing and synthesizing information from diverse sources. Following an Agile development approach, the project is in its early stages, with ten user interviews completed. The plan is to continue with another cycle of interviews, followed by further development, ensuring that the product aligns with user needs and preferences.

### Setup

#### API Keys
To get started, you will need to set up an environment and an API key in [Pinecone](https://docs.pinecone.io/guides/get-started/quickstart) and generate an [OpenAI API key](https://platform.openai.com/docs/guides/production-best-practices/api-keys). Please add those to the `.env` file. The OpenAI API key will be also used for the REACT_APP_API_KEY. 


#### Running the Project

To run the project locally, clone the repository. Then, open two terminals. 

In the first terminal, navigate to the `client` folder and run `npm install` to install the dependencies. Then, run `npm run dev` to start the React app.

In the second terminal, navigate to the `server` folder and run `npm install` to install the dependencies. Then, run `npm start` to start the Node server.

The web app should now be running on `localhost:3000`.


### Project Structure

Most notable files and folders:

> client: React frontend to display the web app to the user
- `src`: Contains the source code for the React application
    - `components`: Contains the React components used to build the web app
    - 
        - `AddModifyTopicSlide.jsx`: Component to modify topics
        - `Card.jsx`: Component to display the question and answer
        - `Chat.jsx`: Component to display the discussion with feedback
        - `CopyPasteTextSlide.jsx`: Component to upload copy-pasted text into Pinecone
        - `Navbar.jsx`: Component to show the progress of the user.
        - `QuestionNavbar.jsx`: Component to show the progress of the user in the questions.
        - `QuizPage.jsx`: The component to hold all the quiz and question information.
        - `WelcomeSlide.jsx`: Component to give an introduction to the user.
    - `App.js`: Main component to render the web app
> server: Node backend to run the server allowing connection to Pinecone vector database
- `server.js` : Runs the server
- `cleanup.js` : Wipes the Pinecone database


[Link to Loom Demo](https://www.loom.com/share/3ce56970548c4503a4578733a0dbbaa9?sid=77ed10b2-5243-4a9f-8f86-2c0eac2dde18) | [Link to Prototype](https://website-prototype-production-cb4c.up.railway.app/)
