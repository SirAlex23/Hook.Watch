# 🪝 Hook-Watch | Phishing Awareness Dashboard

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Hook-Watch** es una herramienta avanzada de simulación de phishing diseñada para auditorías de seguridad y concienciación. Permite gestionar objetivos, lanzar campañas realistas y monitorizar resultados en tiempo real.

## 🚀 Características Principales

* **📊 Dashboard en Tiempo Real:** Visualización de métricas de riesgo y eventos de clic.
* **📧 Motor de Envío:** Integración con Gmail para el envío de plantillas personalizadas (Finanzas, Seguridad, etc.).
* **📱 Diseño Responsivo:** Optimizado para dispositivos móviles para auditorías en cualquier lugar [cite: 2026-02-01].
* **🔗 Tracking Inteligente:** Seguimiento individualizado de objetivos mediante rutas dinámicas `/l/[id]`.

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js con TypeScript.
* **Estilos:** Tailwind CSS (Dark Mode nativo).
* **Base de Datos:** Supabase (PostgreSQL).
* **Correo:** Nodemailer con transporte de Gmail.

## ⚙️ Configuración

Para ejecutar este proyecto en local o desplegarlo, necesitas configurar las siguientes variables de entorno:

| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `GMAIL_USER` | Cuenta de correo emisora |
| `GMAIL_APP_PASSWORD` | Contraseña de aplicación de Google |

---
*Desarrollado con fines educativos y de auditoría de seguridad.*
