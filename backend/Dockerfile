# Backend/Dockerfile # Dockerfile for the backend service

# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
# This is done first to leverage Docker's caching, as these files don't change often
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code to the container
COPY . .

# Expose the port your Express app will run on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]