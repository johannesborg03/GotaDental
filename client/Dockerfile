# Use official Node.js image as a base
FROM node:22-alpine

# Set environment to production by default
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/client

# Copy package files first to leverage caching for dependencies
COPY package.json package-lock.json ./

# Install dependencies (for production builds)
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Expose the port the app will run on
EXPOSE 8080

# Define the default command to build and run the app
CMD ["npm", "run", "serve"]