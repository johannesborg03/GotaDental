# Use official Node.js image as a base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the local client directory's package files into the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client application source code into the container
COPY . .

# Expose the port the app will run on
EXPOSE 5173

# Run the app with Vite binding to all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]