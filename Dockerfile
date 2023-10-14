# Use an official Node.js runtime as the base image
FROM node:14

# Create and set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application source code to the container
COPY . .

# Expose the port your app is listening on (if applicable)
EXPOSE 3000

# Start your Node.js application
CMD ["node", "app.js"]
