# Use Alpine image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/coreServices/OfficesService

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the application's port
EXPOSE 3005

# Define the default command to run the app
CMD ["npm", "run", "dev"]
