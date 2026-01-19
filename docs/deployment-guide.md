# Guía de Despliegue - MiBoletoNi (Fygaro + DigitalOcean)

## 1. Requisitos Previos
- Cuenta en DigitalOcean.
- Docker y Docker Compose instalados localmente (para pruebas).
- Credenciales de Fygaro (API Key, API Secret).
- Credenciales de Firebase Admin SDK (JSON de cuenta de servicio).

## 2. Configuración de Variables de Entorno (.env.local / .env.production)
Asegúrese de definir las siguientes variables en su archivo `.env` o en el entorno de App Platform:

```env
# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... resto de config cliente

# Firebase Admin SDK (Backend / API Routes)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Fygaro Payments
FYGARO_API_KEY=tu_api_key_publica
FYGARO_API_SECRET=tu_api_secret_privado
```

## 3. Ejecución Local con Docker
Para probar la imagen de producción localmente:

1.  Construir y levantar el contenedor:
    ```powershell
    docker-compose up --build
    ```
2.  La aplicación estará disponible en `http://localhost:3000`.

## 4. Despliegue en DigitalOcean (App Platform)

1.  **Crear App**: Conecte su repositorio de GitHub.
2.  **Detectar Docker**: DigitalOcean detectará automáticamente el `Dockerfile`.
3.  **Configurar Variables**:
    - Copie todas las variables de su `.env` al panel "Environment Variables" de la App.
    - **Importante**: Para `FIREBASE_PRIVATE_KEY`, asegúrese de que los saltos de línea se manejen correctamente (a veces requiere comillas o reemplazar `\n` por saltos reales dependiendo de la interfaz, pero Next.js suele manejar `\n` literal si se escapa bien).
4.  **Puerto**: Asegúrese de que el puerto expuesto sea `3000` (HTTP).
5.  **Desplegar**: Haga clic en "Launch App".

## 5. Pruebas de Pago (Fygaro)
1.  Navegue a la página de compra de boletos.
2.  Seleccione boletos y proceda al pago.
3.  Se generará un token JWT usando la ruta `/api/fygaro/generate-token`.
4.  Se renderizará el Botón de Pago de Fygaro.
5.  Complete el pago (Entorno de pruebas si aplica, o real).
6.  **Webhook**: Fygaro notificará a `https://tu-dominio.com/api/fygaro/webhook`.
    - Revise los logs de la aplicación en DigitalOcean para ver la carga útil del webhook ("Fygaro Webhook Payload").

## 6. Solución de Problemas Comunes

### Error: "Failed to parse private key" / "Too few bytes to read ASN.1 value"
Este error ocurre cuando la `FIREBASE_PRIVATE_KEY` no se lee correctamente debido al formato de los saltos de línea.

**Solución en .env.local (Docker/Local):**
Asegúrese de que la clave esté en una sola línea y use `\n` literal para los saltos de línea. Debe estar entre comillas dobles.
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCZKcwggSiAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
```
*No copie y pegue la clave tal cual desde el archivo JSON si tiene saltos de línea reales. Reemplácelos manualmente o use un editor de texto para convertir saltos de línea a `\n`.*

### Error de Conexión con Docker (DNS)
Si ve errores como `lookup registry-1.docker.io: no such host`, suele ser un problema temporal de DNS o de bloqueo de red en su máquina. Reiniciar Docker Desktop o correr `wsl --shutdown` a veces ayuda en Windows.

## 7. Guía de Pruebas (Walkthrough)

1.  **Iniciar Entorno**:
    Asegúrese de que el contenedor esté corriendo sin errores:
    ```powershell
    docker-compose up --build
    ```
    Verifique que en la consola salga: `✅ Firebase Admin SDK inicializado correctamente (PRODUCCIÓN)` (o advertencia de placeholder si faltan credenciales, pero idealmente debe funcionar).

2.  **Navegar a la Web**:
    Abra `http://localhost:3000`.

3.  **Probar Flujo de Pago**:
    - Vaya a la sección de eventos y seleccione un boleto.
    - Llene los datos del comprador.
    - En la pantalla de pago, verá el resumen y el botón **"Pagar con Fygaro"**.
    - **Haga clic en Pagar**.
    - Debería ser redirigido a la página segura de Fygaro (`https://www.fygaro.com/en/payments/...`).

4.  **Confirmar Webhook (Simulación)**:
    Como `localhost` no es accesible desde internet, Fygaro no podrá enviar el webhook real a su Docker local.
    Para probar que su backend procesa el webhook, puede usar Postman o curl:

    ```bash
    curl -X POST http://localhost:3000/api/fygaro/webhook \
    -H "Content-Type: application/json" \
    -d '{ "status": "paid", "reference": "order-123456", "amount": 100.00 }'
    ```
    Debería recibir: `{"received":true}`.

