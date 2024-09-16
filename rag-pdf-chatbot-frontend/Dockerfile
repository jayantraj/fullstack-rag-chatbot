# Use an official node image as the base
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Serve the app using a simple http server
RUN npm install -g serve
CMD ["serve", "-s", "build"]

# Expose port 3000 to access the app
EXPOSE 3000
