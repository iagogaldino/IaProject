# Use Node.js image for development
FROM node:20.19

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the Angular dev server port
EXPOSE 4200

# Run Angular in dev mode
CMD ["npm", "start"]
