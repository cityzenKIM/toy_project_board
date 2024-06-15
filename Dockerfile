# Use the official Node.js image as the base image
FROM node:14-alpine

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY /shop/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "run", "start:prod"]
