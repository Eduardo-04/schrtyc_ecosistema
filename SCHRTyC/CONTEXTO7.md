# CONTEXTO 7: Credenciales y Accesos del Ecosistema

Este documento resume los accesos configurados para el desarrollo local del ecosistema SCHRTyC.

## 🌐 URLs del Sistema
| Componente | URL Local | Descripción |
| :--- | :--- | :--- |
| **Sitio Web Público** | [http://localhost:3000](http://localhost:3000) | Portal ciudadano (Frontend) |
| **Panel Admin (CMS)** | [http://localhost:3001](http://localhost:3001) | Gestión de contenidos |
| **API Backend** | [http://localhost:3005/api](http://localhost:3005/api) | Servicios y Endpoints |
| **Gestor de DB (Adminer)** | [http://localhost:8080](http://localhost:8080) | Administración visual de MariaDB |

---

## 🔐 Credenciales de Acceso

### 1. Panel de Administración (CMS)
Configurado mediante variables de entorno en `docker-compose.yml`.
- **Email:** `admin@example.com`
- **Contraseña:** `admin123`
- **Rol:** Administrador

### 2. Base de Datos (Adminer / Conexión Directa)
- **Motor:** MariaDB / MySQL
- **Servidor (Host):** `db` (dentro de Docker) o `localhost:3306` (si se expone)
- **Usuario:** `appuser`
- **Contraseña:** `apppassword`
- **Base de datos:** `schrtyc_db`

### 3. Seguridad API
- **JWT Secret:** `supersecret` (usado para la firma de tokens)

---

## 👥 Estructura de Roles (RBAC) - Próxima Implementación
Se ha definido la siguiente división de permisos para el sistema:

| Rol | Alcance | Módulos Permitidos |
| :--- | :--- | :--- |
| **Super Administrador** (`admin`) | Acceso Total | Todos los módulos + Gestión de Usuarios |
| **Editor de Prensa** (`editor_prensa`) | Contenido Dinámico | Noticias y Galería de Arte |
| **Editor Institucional** (`editor_inst`) | Información Fija | Páginas Institucionales, Transparencia y Trámites |
| **Editor de Programación** (`editor_prog`) | Medios y Grilla | Estaciones, Programas y Programación |

## 🛡️ Estrategia de Seguridad
Para mitigar riesgos de XSS y ataques sobre el servidor HTTP:

1.  **JWT en Memoria (State)**: El Access Token se guardará únicamente en el estado de React (memoria) para evitar que sea robado mediante scripts maliciosos.
2.  **Refresh Token (HttpOnly Cookie)**: Se implementará una cookie de tipo `HttpOnly`, `Secure` y `SameSite=Strict` para renovar el Access Token automáticamente sin intervención del usuario ni exposición al JS.
3.  **HTTPS (Nginx Reverse Proxy)**: En producción, se configurará un contenedor de Nginx con SSL (Let's Encrypt) que actúe como terminador de TLS, cifrando todo el tráfico antes de llegar a los contenedores internos.

