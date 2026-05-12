# CONTEXTO6 — Plan de Despliegue en Ubuntu 16.04 LTS (Dockerizado)

**Generado:** 2026-05-11
**Servidor Objetivo:**
- SO: Ubuntu 16.04.3 LTS (Xenial Xerus) - x86_64
- RAM: 15GB
- Almacenamiento: 900GB+
- Web Server Host: Apache 2.4.18

Este documento consolida la estrategia para desplegar el ecosistema del CMS (`SCHRTyC/`) y la página pública (`schrtyc-web/web/`) mediante Docker y Docker Compose, usando el Apache existente como Reverse Proxy.

---

## 1. Modificaciones Locales Necesarias (A preparar en el código fuente)

Para que el proyecto esté listo para empaquetarse en Docker, necesitamos crear los siguientes archivos de configuración en el entorno local antes de subir todo al servidor:

### 1.1 Archivos `.dockerignore`
Críticos para evitar copiar la carpeta `node_modules` de Windows al contenedor de Linux.
**Crear en:** `backend/.dockerignore`, `frontend/.dockerignore` y en el otro proyecto `schrtyc-web/web/.dockerignore`
```text
node_modules
dist
.env
npm-debug.log
```

### 1.2 Dockerfile del Backend
Define el contenedor para Node.js y la API Express.
**Crear en:** `backend/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/app.js"]
```

### 1.3 Dockerfiles de los Frontends (React/Vite)
Se utiliza un *multi-stage build*: primero Node compila la app, luego Nginx sirve los archivos estáticos generados.
**Crear en:** `frontend/Dockerfile` y en el otro proyecto `schrtyc-web/web/Dockerfile`
```dockerfile
# Etapa 1: Construcción
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: Servidor Web Ligero
FROM nginx:alpine
# Copiamos el build estático a la carpeta de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copiamos la configuración para la SPA (React Router)
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 1.4 Configuración Nginx SPA (Para React)
Previene los errores `404 Not Found` al recargar páginas cuando se usa React Router.
**Crear en:** `frontend/nginx-spa.conf` y `schrtyc-web/web/nginx-spa.conf`
```nginx
server {
  listen 80;
  server_name localhost;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 1.5 Archivo Docker Compose General
Este archivo orquesta los 3 contenedores y monta los volúmenes para que los JSON no se borren. Asume que la carpeta `SCHRTyC/` y `schrtyc-web/` están juntas en el servidor.
**Crear en:** La carpeta raíz del servidor (o localmente para llevar un registro, por ejemplo en la raíz de `SCHRTyC/docker-compose.yml`)
```yaml
version: '3.9'

services:
  backend:
    build: ./SCHRTyC/backend
    container_name: schrtyc-backend
    restart: unless-stopped
    ports:
      - "127.0.0.1:3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./SCHRTyC/backend/data:/app/data
      - ./SCHRTyC/backend/uploads:/app/uploads

  admin-frontend:
    build: ./SCHRTyC/frontend
    container_name: schrtyc-admin
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"

  web-frontend:
    build: ./schrtyc-web/web
    container_name: schrtyc-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:8081:80"
```

---

## 2. Instrucciones para el Servidor Ubuntu 16.04

Una vez que los archivos locales estén listos y subidos al servidor, se debe preparar la máquina anfitriona.

### 2.1 Arreglar Permisos (Seguridad Crítica)
El servidor tiene un error en `sudoers` (UID 750 en lugar de 0) que impide la correcta ejecución de tareas administrativas.
```bash
# Entrar como root
chown root:root /etc/sudoers.d
chmod 755 /etc/sudoers.d
```

### 2.2 Instalar Docker en Ubuntu 16.04 (Xenial)
Como 16.04 es EOL, hay que forzar el repositorio estable de Docker para Xenial.
```bash
# 1. Instalar dependencias
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common

# 2. Agregar la llave GPG oficial de Docker y el repositorio
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable"

# 3. Instalar Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# 4. Instalar Docker Compose (Binario moderno v2, el de apt-get es obsoleto)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2.3 Preparar Apache (Reverse Proxy)
El servidor ya tiene Apache ocupando el puerto 80. Lo configuraremos para que tome el tráfico y lo mande a los contenedores locales (127.0.0.1).

```bash
# 1. Habilitar Módulos proxy
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

**Crear el VirtualHost (`/etc/apache2/sites-available/schrtyc.conf`):**
```apache
<VirtualHost *:80>
  ServerName radiotvycine.chiapas.gob.mx

  # 1. Landing pública -> Contenedor Web
  ProxyPass        /       http://127.0.0.1:8081/
  ProxyPassReverse /       http://127.0.0.1:8081/

  # 2. CMS Admin -> Contenedor Admin
  ProxyPass        /admin/ http://127.0.0.1:8080/
  ProxyPassReverse /admin/ http://127.0.0.1:8080/

  # 3. API Backend -> Contenedor Node
  ProxyPass        /api/   http://127.0.0.1:3001/api/
  ProxyPassReverse /api/   http://127.0.0.1:3001/api/
</VirtualHost>
```

**Habilitar el sitio en Apache:**
```bash
sudo a2ensite schrtyc.conf
sudo systemctl reload apache2
```

### 2.4 Levantar el Sistema (Despliegue final)
En el directorio raíz del servidor donde esté guardado el `docker-compose.yml`:
```bash
docker-compose build
docker-compose up -d
```
