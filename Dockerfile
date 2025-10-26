# Use official Node.js 20 image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first for better cache
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application (frontend and backend)
RUN yarn build

# Expose the ports your app uses (adjust if needed)
EXPOSE 8085

# Start the application
CMD ["yarn", "start"]
