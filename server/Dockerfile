# Use official lightweight Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Cloud Run injects the PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Start Express server
CMD [ "npm", "start" ]
