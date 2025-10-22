FROM node:18-alpine

WORKDIR /app

# Install dependencies based on package.json
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Vite dev server
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
