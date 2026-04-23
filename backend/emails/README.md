# Carpeta de Correos de Desarrollo

Esta carpeta almacena los correos generados por la aplicación en modo desarrollo cuando se usa el backend de archivos.

## ¿Cómo ver los correos?

### Opción 1: API de Desarrollo
Accede a `http://localhost:8000/api/emails/` para ver todos los correos guardados en formato JSON.

Ejemplo:
```bash
curl http://localhost:8000/api/emails/
```

Para ver un correo específico:
```bash
curl http://localhost:8000/api/emails/NOMBRE_DEL_ARCHIVO.txt
```

### Opción 2: Sistema de Archivos
Los correos se guardan como archivos de texto en esta carpeta. Puedes abrirlos directamente con cualquier editor de texto.

## Estructura de un archivo de correo

```
From: no-reply@localhost
Subject: Recuperación de contraseña
To: usuario@example.com
Date: [fecha del envío]
Message-ID: [id único]

[Contenido del correo aquí]
```

## Configurar SMTP Real en Producción

Para usar SMTP real (Gmail, SendGrid, Mailtrap, etc.), edita `.env`:

### Ejemplo con Gmail:
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-contraseña-de-app
EMAIL_USE_TLS=true
DEFAULT_FROM_EMAIL=tu-email@gmail.com
```

### Ejemplo con Mailtrap (Recomendado para desarrollo):
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=live.smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_HOST_USER=api
EMAIL_HOST_PASSWORD=tu-token-mailtrap
EMAIL_USE_TLS=true
DEFAULT_FROM_EMAIL=your-email@example.com
```

## Notas

- Los correos en desarrollo se guardan como archivos de texto
- Cada correo tiene un nombre único basado en la fecha y hora
- Esta carpeta puede ser excluida del repositorio (ya está en .gitignore)
