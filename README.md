# 🎉 Landing RSVP — Cumple Carme & Inne

Landing page de confirmación de asistencia para el cumpleaños de Carme & Inne en **Gravity Park**.

**Evento:** Sábado 25 de abril de 2026 · 15:00 hs
**Lugar:** Gravity Park · Av. Gaona 1837, Caballito, Buenos Aires

---

## ✅ ¿Qué hace esta app?

| Funcionalidad | Estado |
|---|---|
| Formulario RSVP (DNI, Nombre, Apellido, Email) | ✅ |
| Guardado automático en Google Sheets | ✅ |
| Contador en vivo de inscriptos | ✅ |
| Countdown hasta el evento | ✅ |
| Email recordatorio automático el día del evento (9 AM) | ✅ |
| Mapa integrado (Gravity Park) | ✅ |
| Diseño mobile-first inspirado en Gravity Park | ✅ |
| Anti-spam (honeypot) | ✅ |
| Validación server-side + client-side | ✅ |
| Deploy gratuito (Vercel) | ✅ |

---

## 🏗️ Arquitectura

```
Frontend (Next.js 14)          Backend gratis            Base de datos gratis
┌─────────────────────┐        ┌────────────────────┐   ┌────────────────────┐
│  Vercel (free tier) │──POST──│  Google Apps       │──▶│   Google Sheets    │
│  landing page       │        │  Script (Web App)  │   │   (compartido con  │
│  /api/rsvp          │──GET───│  /exec?action=count│   │    los padres)     │
│  /api/count         │        └────────────────────┘   └────────────────────┘
└─────────────────────┘                │
                                       │ 25/4 a las 9 AM
                                       ▼
                              Trigger automático →
                              Email con tarjeta a
                              todos los inscriptos
```

**Costo total: $0**
- Vercel Free: 100 GB bandwidth, sin límite de deploys
- Google Apps Script: gratis, sin servidor
- Google Sheets: gratis
- Gmail via Apps Script: 100 emails/día (más que suficiente para un cumple)

---

## 📁 Estructura de carpetas

```
.
├── app/
│   ├── globals.css          # Estilos globales + clases utilitarias
│   ├── layout.tsx           # Metadatos, fonts (Fredoka One + Nunito)
│   ├── page.tsx             # Página principal (SSR con conteo inicial)
│   └── api/
│       ├── rsvp/route.ts    # POST — recibe inscripción → proxy a Apps Script
│       └── count/route.ts   # GET  — devuelve conteo actual
├── components/
│   ├── HeroSection.tsx      # Hero: título, tarjeta, CTA, contador
│   ├── CountdownSection.tsx # Countdown + detalles del evento
│   ├── CounterBadge.tsx     # Badge "Ya hay X confirmaciones" (se actualiza solo)
│   ├── RSVPSection.tsx      # Sección contenedora del formulario
│   ├── RSVPForm.tsx         # Formulario completo con validaciones
│   ├── MapSection.tsx       # Mapa Google Maps + cómo llegar
│   └── FooterSection.tsx    # Footer
├── public/
│   └── assets/
│       └── invitation-card.jpg  # ← Tarjeta de invitación (ya incluida)
├── apps-script/
│   └── Code.gs              # Script completo para Google Apps Script
├── .env.example             # Template de variables de entorno
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 🚀 Guía de deploy — Paso a paso

### PASO 1: Crear el Google Sheet

1. Ir a [sheets.google.com](https://sheets.google.com)
2. Crear un nuevo spreadsheet
3. Nombrarlo: `RSVP Cumple Carme & Inne`
4. **Copiar el ID** de la URL:
   `docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`
5. Compartirlo con el email de los padres organizadores (modo Editor)

---

### PASO 2: Crear y desplegar el Google Apps Script

1. Ir a [script.google.com](https://script.google.com)
2. Clic en **"Nuevo proyecto"**
3. Nombrar el proyecto: `RSVP Cumple Carme & Inne`
4. **Antes de pegar el código:** ir a Configuración del proyecto (⚙️) → Zona horaria → seleccionar `America/Argentina/Buenos_Aires`
5. Borrar todo el contenido del editor y **pegar el contenido de `apps-script/Code.gs`**
6. En el archivo `Code.gs`, buscar `var CONFIG` y actualizar:
   ```javascript
   SPREADSHEET_ID: "PEGAR_AQUÍ_EL_ID_DE_TU_GOOGLE_SHEET",  // del Paso 1
   INVITATION_IMAGE_URL: "https://TU_APP.vercel.app/assets/invitation-card.jpg",  // del Paso 4
   LANDING_URL: "https://TU_APP.vercel.app",  // del Paso 4
   ```
7. **Guardar** el proyecto (Ctrl+S)
8. Ejecutar `setupSheet` una vez:
   Arriba del editor, selector de función → elegir `setupSheet` → clic en ▶️ Ejecutar
   *(te pedirá permisos — aceptarlos todos)*
9. **Desplegar como Web App:**
   - Clic en el botón azul **"Desplegar"** → **"Nueva implementación"**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo** (tu email)
   - Quién tiene acceso: **Cualquier usuario**
   - Clic en **"Implementar"**
   - **Copiar la URL** que termina en `.../exec` — la necesitás en el Paso 3

> ⚠️ Cada vez que modifiques el código, debés hacer una **nueva implementación** para que los cambios tomen efecto.

---

### PASO 3: Configurar y desplegar en Vercel

#### Opción A — Desde GitHub (recomendado)

1. Subir el proyecto a un repositorio GitHub
2. Ir a [vercel.com](https://vercel.com) → Sign in con GitHub (gratis)
3. Clic en **"New Project"** → importar tu repositorio
4. En **"Environment Variables"** agregar:
   | Nombre | Valor |
   |--------|-------|
   | `APPS_SCRIPT_URL` | La URL del Paso 2 |
   | `NEXT_PUBLIC_APP_URL` | `https://tu-app.vercel.app` *(primero deployas, luego copias la URL)* |
5. Clic en **"Deploy"** — Vercel construye y despliega automáticamente
6. Vercel te da una URL tipo `cumple-carme-inne.vercel.app` — copiarla y actualizar `NEXT_PUBLIC_APP_URL`

#### Opción B — Sin GitHub, con Vercel CLI

```bash
npm install -g vercel
cd "Landing RSVP - Cumple Carme & Inne"
npm install
vercel
# Seguir las instrucciones en pantalla
```

---

### PASO 4: Actualizar el Apps Script con la URL de Vercel

Una vez que tenés la URL de Vercel (ej: `https://cumple-carme-inne.vercel.app`):

1. Volver al Apps Script
2. Actualizar en `CONFIG`:
   ```javascript
   INVITATION_IMAGE_URL: "https://cumple-carme-inne.vercel.app/assets/invitation-card.jpg",
   LANDING_URL: "https://cumple-carme-inne.vercel.app",
   ```
3. **Nueva implementación** (Desplegar → Nueva implementación → misma configuración → Implementar)
4. También actualizar en Vercel → Settings → Environment Variables:
   - `NEXT_PUBLIC_APP_URL` = `https://cumple-carme-inne.vercel.app`

---

### PASO 5: Programar el recordatorio automático

1. En el Apps Script, selector de función → elegir `setupEventDayTrigger` → ▶️ Ejecutar
2. Aceptar los permisos si los pide
3. En el log verás: `✅ Trigger configurado: sendEventDayReminders el 25/4/2026 a las 9:00 hs (Argentina)`
4. Para verificar: menú **Activadores** (ícono del reloj en el sidebar izquierdo)

> El trigger se ejecutará automáticamente el **25/4/2026 a las 9:00 AM Argentina** y enviará el email con la tarjeta a cada inscripto confirmado. Si alguien ya recibió el recordatorio (columna H = "SI"), no se reenvía.

---

### PASO 6: Probar todo

1. Abrir la URL de Vercel en el celular
2. Completar el formulario con tus datos
3. Verificar que aparezca en el Google Sheet
4. En Apps Script: ejecutar `testSendOneEmail` (cambiando el email por el tuyo)
5. Verificar que llegó el mail con la tarjeta

---

## 🖼️ Cambiar la tarjeta de invitación

La tarjeta ya está incluida en `public/assets/invitation-card.jpg`.

Si querés reemplazarla:
1. Guardá tu nueva imagen como `invitation-card.jpg` (o `.png`)
2. Reemplazá el archivo en `public/assets/`
3. Si el nombre es distinto, editá en `HeroSection.tsx`:
   ```tsx
   src="/assets/NOMBRE_DE_TU_IMAGEN.jpg"
   ```
4. Hacer redeploy en Vercel (si usás GitHub, con un `git push` alcanza)

---

## 📅 Cambiar fecha, hora o dirección del evento

Hay **dos lugares** donde actualizar:

### 1. En `components/CountdownSection.tsx`
```typescript
const EVENT_ISO = "2026-04-25T15:00:00-03:00"; // ← Cambiar fecha/hora
```

### 2. En `apps-script/Code.gs`
```javascript
EVENT_DATE_STR: "Sábado 25 de abril de 2026",  // ← Texto en el email
EVENT_TIME:     "15:00 hs",
EVENT_ADDRESS:  "Gravity Park · Av. Gaona 1837, Caballito",
EVENT_YEAR:  2026,
EVENT_MONTH: 4,
EVENT_DAY:   25,
```

También en `components/HeroSection.tsx`, `components/FooterSection.tsx` y `components/MapSection.tsx` hay textos con la fecha que podés actualizar.

---

## 🔧 Correr en local (desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores reales

# 3. Correr el servidor de desarrollo
npm run dev

# 4. Abrir http://localhost:3000
```

> **Nota:** sin `APPS_SCRIPT_URL` configurado, el formulario mostrará un mensaje de error amigable. El contador arrancará en 0. Todo lo demás funciona normalmente.

---

## 🔐 Seguridad

| Medida | Implementación |
|--------|----------------|
| Honeypot anti-spam | Campo `_hp` oculto en el form |
| Sanitización de inputs | Server-side en `/api/rsvp` |
| Validación doble | Client-side (UX) + Server-side (seguridad) |
| URL del Apps Script oculta | Solo en variables de entorno del servidor |
| Datos privados del Sheet | El Sheet NO es público |
| Sin secretos en el frontend | `APPS_SCRIPT_URL` no tiene prefijo `NEXT_PUBLIC_` |
| Noindex/nofollow | La página no se indexa en buscadores |

---

## ❓ Troubleshooting frecuente

**El formulario dice "El sistema de inscripción no está configurado"**
→ `APPS_SCRIPT_URL` no está configurada en las variables de entorno de Vercel.

**El Apps Script devuelve error 401/403**
→ El despliegue del Apps Script no tiene "Quién tiene acceso: Cualquier usuario". Hacer nueva implementación con esa configuración.

**El contador siempre muestra 0**
→ Verificar que el Apps Script responde a GET. Probar la URL en el browser: `https://tu-script.../exec?action=count` — debe devolver `{"count":N}`.

**El recordatorio no se envía el día del evento**
→ Verificar que ejecutaste `setupEventDayTrigger` y que la zona horaria del proyecto es `America/Argentina/Buenos_Aires`. Verlo en el menú Activadores del Apps Script.

**"Ya hay una inscripción con ese DNI/email"**
→ Es el comportamiento esperado — el sistema previene duplicados.

**El mapa no carga**
→ El iframe de Google Maps a veces tarda. No requiere API key. Verificar conexión.

**Quiero hacer cambios y redesplegar**
→ Si usás GitHub: `git add . && git commit -m "cambio" && git push` → Vercel redesploya automáticamente.

---

## 📞 ¿Necesitás ayuda?

El sistema está pensado para ser simple. Si algo no funciona, los pasos más probables son:
1. Verificar que `APPS_SCRIPT_URL` esté bien copiada en Vercel
2. Verificar que el Apps Script esté desplegado con acceso "Cualquier usuario"
3. Verificar que el `SPREADSHEET_ID` en `Code.gs` sea el correcto

---

*Hecho con 💙 para el cumple de Carme & Inne — Gravity Park, 25/4/2026*
