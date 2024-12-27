# Use Alpine image 
FROM node:22-alpine

# Set environment to production by default
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/coreServices/OfficesService

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
RUN chown -R appuser:appgroup /usr/src/coreServices/OfficesService
USER appuser

# Expose the application's port
EXPOSE 3005

# Define the default command to run the app
CMD ["npm", "run", "dev"]
