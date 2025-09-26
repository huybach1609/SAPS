# Build + run with serve
FROM node:20-alpine

# Define build arguments for environment variables
ARG VITE_API_URL
ARG VITE_OWNER_ROLE
ARG VITE_ADMIN_ROLE

# Set environment variables during the build process
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_OWNER_ROLE=${VITE_OWNER_ROLE}
ENV VITE_ADMIN_ROLE=${VITE_ADMIN_ROLE}

WORKDIR /app

# Better layer caching
COPY package*.json ./
RUN npm ci --omit=dev=false

# Build
COPY . .


RUN npm run build

# Install only the static server globally
RUN npm i -g serve

# Drop root
USER node

EXPOSE 5173
# Explicitly bind to the container port
CMD ["serve", "-s", "dist", "-l", "5173", "--single", "--cors"]





