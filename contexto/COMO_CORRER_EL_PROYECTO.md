# Cómo Correr el Proyecto (SCHRTyC Ecosistema)

Este proyecto está orquestado utilizando **Docker Compose**, lo que facilita levantar todos los servicios (frontend web, panel de administración, API backend y base de datos) con un solo comando.

## Prerrequisitos

*   [Docker](https://www.docker.com/products/docker-desktop) instalado en tu sistema.
*   [Docker Compose](https://docs.docker.com/compose/install/) (usualmente viene incluido con Docker Desktop).

## Instrucciones Paso a Paso

1.  **Variables de Entorno**
    Asegúrate de contar con el archivo `.env` en la raíz del proyecto. Si no existe, puedes crearlo copiando el archivo de ejemplo:
    ```bash
    cp .env.example .env
    ```
    *(Nota: Revisa y ajusta los valores de contraseñas, usuarios de base de datos y otras variables de entorno dentro del archivo `.env` si es necesario).*

2.  **Levantar los Servicios**
    Abre una terminal en la raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`) y ejecuta el siguiente comando:
    ```bash
    docker-compose up -d --build
    ```
    *   `-d`: Ejecuta los contenedores en segundo plano (detached mode).
    *   `--build`: Fuerza la reconstrucción de las imágenes. Es recomendable la primera vez o si hubo cambios en los `Dockerfile` o dependencias. Si no necesitas reconstruir, puedes omitir esta bandera y usar solo `docker-compose up -d`.

3.  **Verificar el Estado**
    Puedes comprobar que los contenedores estén corriendo correctamente con:
    ```bash
    docker-compose ps
    ```
    o desde la interfaz gráfica de Docker Desktop.

## Accesos a los Servicios

Una vez que los contenedores estén levantados, los servicios estarán disponibles en los siguientes puertos de tu máquina local:

*   **Página Web Pública (Web):** [http://localhost:3000](http://localhost:3000)
*   **Panel de Administración (Admin):** [http://localhost:3001](http://localhost:3001)
*   **API Backend:** [http://localhost:3005](http://localhost:3005)
*   **Gestor de Base de Datos (Adminer):** [http://localhost:8080](http://localhost:8080)

## Detener el Proyecto

Para detener todos los servicios sin eliminar los volúmenes de datos (tu base de datos se conservará), ejecuta:
```bash
docker-compose down
```

Si deseas detener los servicios y **eliminar** los volúmenes de datos (para hacer un borrón y cuenta nueva), ejecuta:
```bash
docker-compose down -v
```
