# Use Node.js Alpine image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/coreServices/TimeslotsService

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Expose the application's port
EXPOSE 3003

# Set environment variables
ENV PORT=3003
ENV BOOKING_DB_URI=mongodb://localhost:27017/booking-database

# Define the default command to run the app
CMD ["npm", "run", "dev"]