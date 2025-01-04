# Use Node.js Alpine image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/coreServices/TimeslotsService

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install 

# Copy the rest of the application source code
COPY . .

# Expose the application's port
EXPOSE 3003

# Set environment variables
ENV PORT=3003
ENV BOOKING_DB_URI=mongodb://mongodb:27017/booking-database
ENV RABBITMQ_URI=amqp://rabbitmq:5672

# Add a Docker health check (remove if it cause issues)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3003/api/health || exit 1

# Define the default command to run the app
CMD ["npm", "run", "dev"]