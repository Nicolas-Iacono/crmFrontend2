# Guía de Despliegue en Hostinger

Esta guía te ayudará a desplegar tu aplicación CRM Inmobiliario en un servidor de Hostinger.

## Pasos para el Despliegue

### 1. Generar el Build de Producción

```bash
# Ejecuta el script de despliegue que hemos creado
npm run deploy
```

Este comando:
- Generará una versión optimizada de producción
- Copiará el archivo .htaccess necesario para el enrutamiento
- Verificará que todas las rutas sean relativas y funcionen correctamente
- Todo el contenido listo para subir estará en la carpeta `dist`

### 2. Subir Archivos a Hostinger

1. Accede a tu panel de control de Hostinger
2. Ve a la sección de Administrador de Archivos o usa FTP
3. Navega hasta la carpeta raíz de tu dominio (generalmente `public_html`)
4. Sube todo el contenido de la carpeta `dist` a esta ubicación

### 3. Configuración del Dominio

- Asegúrate de que tu dominio esté configurado para apuntar a la carpeta donde subiste los archivos
- Verifica que el archivo `index.html` sea la página predeterminada

### 4. Verificación

- Accede a tu sitio a través del navegador
- Verifica que la navegación funcione correctamente
- Prueba varias rutas para asegurarte de que el enrutamiento SPA funcione

### Solución de Problemas Comunes

1. **Errores 404 al navegar:** Verifica que el archivo `.htaccess` se haya subido correctamente.
2. **Problemas con las rutas de recursos:** Asegúrate de que todos los enlaces a CSS/JS sean relativos.
3. **Problemas de API:** Verifica que la variable de entorno `VITE_API_URL` esté configurada correctamente.

### Optimizaciones

La configuración de Vite que hemos implementado ya incluye:
- Minificación de código
- Eliminación de console.logs
- División de código para mejor rendimiento
- Configuración de caché para recursos estáticos

## Mantenimiento

Para futuras actualizaciones:
1. Realiza los cambios en tu código
2. Ejecuta `npm run deploy` nuevamente
3. Sube solo los archivos modificados a Hostinger
