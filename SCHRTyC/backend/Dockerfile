FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Crear la carpeta de uploads si no existe para asegurar el volumen
RUN mkdir -p uploads 
EXPOSE 3001
CMD ["npm", "start"]
