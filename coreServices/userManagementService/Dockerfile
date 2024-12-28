# Use Node.js Alpine image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/coreServices/userManagementService

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install 

# Copy the rest of the application source code
COPY . .

# Expose the application's port
EXPOSE 3004

# Set environment variables
ENV PORT=3004
ENV DENTIST_DB_URI=mongodb://localhost:27017/dentist-database
ENV PATIENT_DB_URI=mongodb://localhost:27017/patient-database

# Define the default command to run the app
CMD ["npm", "run", "dev"]