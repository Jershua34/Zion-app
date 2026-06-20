# Guía de Despliegue para Producción - Zion Quepos PWA

Sigue estos pasos para desplegar la aplicación y conectarla con servicios reales.

---

## 1. Base de Datos (MongoDB Atlas)

1. Regístrate o inicia sesión en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crea un nuevo clúster gratuito (Shared) en la región más cercana.
3. En la pestaña **Database Access**, crea un usuario de base de datos con permisos de lectura y escritura.
4. En **Network Access**, permite el acceso desde cualquier IP (`0.0.0.0/0`) para que plataformas de hosting como Render o Railway puedan conectarse.
5. Copia la cadena de conexión de MongoDB (URI) que se parece a:
   `mongodb+srv://<usuario>:<password>@cluster.mongodb.net/zion-quepos?retryWrites=true&w=majority`

---

## 2. Despliegue del Backend (Render / Railway)

### Opción: Render (Gratuito y Recomendado)
1. Regístrate en [Render.com](https://render.com) y conecta tu cuenta de GitHub.
2. Presiona **New +** y selecciona **Web Service**.
3. Conecta tu repositorio.
4. Configura los siguientes campos:
   - **Name**: `zion-quepos-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. En la sección **Advanced / Environment Variables**, agrega las siguientes variables de entorno:
   - `MONGO_URI`: (Tu URI de MongoDB Atlas copiado arriba)
   - `JWT_SECRET`: (Una frase aleatoria segura)
   - `PORT`: `5000`
   - `FIREBASE_CREDENTIALS_JSON`: (Credenciales JSON de FCM, opcional)
   - `TWILIO_ACCOUNT_SID`: (Opcional)
   - `TWILIO_AUTH_TOKEN`: (Opcional)
   - `TWILIO_WHATSAPP_NUMBER`: (Opcional, e.g. `whatsapp:+14155238886`)
   - `RESEND_API_KEY`: (Opcional, de Resend.com)
   - `YOUTUBE_API_KEY`: (Opcional, de Google Cloud Console)
   - `YOUTUBE_CHANNEL_ID`: (Opcional, id de tu canal)
6. Presiona **Create Web Service**. Copia la URL generada (e.g. `https://zion-quepos-api.onrender.com`).

---

## 3. Configuración del Frontend

1. Abre el archivo [app.js](file:///C:/Users/User/.gemini/antigravity/scratch/zion-quepos/frontend/js/app.js).
2. Modifica la variable `API_BASE` en la línea 3 para que apunte a la URL de tu backend en producción:
   ```javascript
   const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
     ? 'http://localhost:5000/api'
     : 'https://TU-API-EN-RENDER.onrender.com/api';
   ```

---

## 4. Despliegue del Frontend (Vercel / Netlify)

### Opción: Vercel
1. Regístrate en [Vercel.com](https://vercel.com).
2. Presiona **Add New** -> **Project**.
3. Importa tu repositorio.
4. En **Framework Preset**, déjalo como `Other` o `Vite` (según corresponda).
5. Configura el **Root Directory** como: `frontend`.
6. Presiona **Deploy**. Vercel compilará e implementará tu aplicación móvil PWA.

---

## 5. Configurar Dominio Personalizado (`zionquepos.org`)

1. En la consola de Vercel (para el frontend), ve a **Settings** -> **Domains**.
2. Añade `zionquepos.org` y `www.zionquepos.org`.
3. Vercel te indicará qué registros DNS configurar en tu proveedor de dominio (e.g. GoDaddy, Namecheap):
   - Registro **A** para `zionquepos.org` apuntando a la IP de Vercel.
   - Registro **CNAME** para `www.zionquepos.org` apuntando a `cname.vercel-dns.com`.
4. Una vez propagados los DNS (puede tardar de 5 minutos a 24 horas), tu PWA estará segura con HTTPS automático provisto por Let's Encrypt.

---

## 6. Configuración de API Keys de Servicios Reales

### A. WhatsApp Business API (Twilio)
1. Regístrate en [Twilio](https://www.twilio.com) y activa el sandbox de WhatsApp.
2. Copia tu `Account SID` y `Auth Token` en las variables de entorno de tu servidor de Render.
3. Registra tu plantilla de mensaje de WhatsApp en Twilio y actualiza el texto en `routes/members.js`.

### B. Notificaciones Push (Firebase FCM)
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Ve a **Configuración del Proyecto** -> **Cuentas de servicio**.
3. Presiona **Generar nueva clave privada**. Esto descargará un archivo `.json`.
4. Abre ese archivo, copia todo su contenido de texto, y pégalo tal cual en la variable `FIREBASE_CREDENTIALS_JSON` de tu servidor.

### C. Correos de Confirmación (Resend)
1. Regístrate en [Resend.com](https://resend.com).
2. Genera una API Key y agrégala como `RESEND_API_KEY`.
3. En la sección **Domains** de Resend, añade tu dominio `zionquepos.org` y configura los registros TXT (SPF/DKIM) en tus DNS para poder enviar correos con el remitente oficial de la iglesia.

### D. YouTube Live Autodetect
1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com).
2. Habilita la **YouTube Data API v3**.
3. Crea credenciales tipo **API Key** y agrégala como `YOUTUBE_API_KEY`.
4. Añade el ID de tu canal de YouTube en la variable `YOUTUBE_CHANNEL_ID` para que el backend detecte las transmisiones de forma automática.
