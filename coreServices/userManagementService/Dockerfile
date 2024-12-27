# Use the latest Node.js Alpine image for smaller image size
FROM node:22-alpine

# Set environment to production by default
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/coreServices/userManagementService

# Copy package files first to leverage caching for dependencies
COPY package.json package-lock.json ./

# Install only production dependencies (for production builds)
RUN npm ci --only=production

# For development, install all dependencies (including devDependencies)
# Uncomment this line if you're building for development:
# RUN npm ci

# Copy the rest of the application source code
COPY . .

# Set up non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/coreServices/userManagementService
USER appuser

# Expose the application's port
EXPOSE 3004

# Set environment variables in the container
ENV PORT=3004
ENV DENTIST_DB_URI=mongodb://localhost:27017/dentist-database
ENV PATIENT_DB_URI=mongodb://localhost:27017/patient-database

# Define the default command to run the app in development mode
CMD ["npm", "run", "dev"]