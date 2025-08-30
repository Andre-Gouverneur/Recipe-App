# Recipe Application

A full-stack web application for managing and sharing recipes. This project is built using a modern stack and is fully containerized with Docker for easy setup and deployment.

## Features

- **View Recipes:** Browse through a collection of all available recipes.
- **Search:** Find specific recipes using the search bar.
- **Add New Recipes:** Create and save new recipes with ingredients, instructions, and images.
- **Edit & Delete:** Update or remove existing recipes.
- **Responsive Design:** The application is accessible and easy to use on both desktop and mobile devices.

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
- **Backend:** Node.js (Express.js)
- **Database:** MongoDB
- **Containerization:** Docker, Docker Compose

## Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone [Your-GitHub-Repository-URL-Here]
    cd [Your-Repository-Name]
    ```

2.  **Start the Application:**
    Navigate to the root directory of the project and run the following command. This will build the Docker images and start all the services (frontend, backend, and database).
    ```bash
    docker-compose up --build
    ```
    The `--build` flag is crucial for the first run or after making changes to the code. On subsequent runs, you can just use `docker-compose up`.

3.  **Access the Application:**
    Once the containers are running, you can access the application in your web browser at:
    `http://localhost:3000`

### Project Structure

├── backend/
│   ├── node_modules/
│   ├── public/             # For uploaded images
│   ├── server.js           # Backend application logic
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── index.html          # Main page
│   ├── add.html            # Add recipe form
│   ├── edit.html           # Edit recipe form
│   ├── view.html           # View single recipe page
│   ├── styles.css
│   ├── script.js           # Frontend application logic
│   └── favicon.png
├── .gitignore              # Files to ignore in Git
├── docker-compose.yml      # Defines and runs the containers
└── README.md


## How to Contribute

Contributions are what make the open-source community an amazing place to learn and grow. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License.

## Contact

Isues Inc.

Project Link: [Your-GitHub-Repository-URL-Here]