import jwt from 'jsonwebtoken';

interface FygaroPaymentData {
    amount: number;
    currency?: string;
    description?: string;
    reference?: string;
    redirectUrl?: string;
}

export class FygaroService {
    private apiKey: string;
    private apiSecret: string;
    private buttonUrl: string;

    constructor() {
        // apiKey = PÚBLICA (Empieza con fyg_pk_...)
        // apiSecret = PRIVADA (Empieza con fyg_sk_...)
        this.apiKey = process.env.FYGARO_API_KEY || '';
        this.apiSecret = process.env.FYGARO_API_SECRET || '';
        this.buttonUrl = process.env.FYGARO_BUTTON_URL || '';

        // LOG DE SEGURIDAD (Añade esto para depurar en Cloud Run)
    if (!this.apiKey || !this.apiSecret) {
        console.error("❌ ERROR: Las credenciales de Fygaro NO están cargadas en las variables de entorno.");
    } else {
        console.log("✅ Credenciales de Fygaro detectadas (Longitud AK:", this.apiKey.length, ")");
    }
}

    public generatePaymentToken(data: FygaroPaymentData): string {
        if (!this.apiKey || !this.apiSecret) {
            throw new Error('Fygaro API Key/Secret not configured');
        }

        const now = Math.floor(Date.now() / 1000);

        // 1. EL PAYLOAD (El cuerpo del mensaje)
        // Ajustado a lo que pidió soporte: usar 'custom_reference'
        const payload = {
            amount: data.amount,
            currency: data.currency || 'NIO',
            custom_reference: data.reference, // Soporte lo llama custom_reference
            description: data.description,
            redirect_url: data.redirectUrl,
            iat: now,       // Issued At (Creado en)
            exp: now + 3600 // Expira en 1 hora (Recomendado por seguridad)
        };

        // 2. EL HEADER (La cabecera)
        // AQUÍ ESTABA EL ERROR: Fygaro necesita el 'kid' explícitamente
        const signOptions: jwt.SignOptions = {
            algorithm: 'HS256',
            header: {
                typ: 'JWT',
                kid: this.apiKey // <--- ¡ESTO ES LO QUE FALTABA! (Tu Llave Pública)
            }
        };

        console.log('🔑 Generando JWT con KID en Header:', this.apiKey);

        // 3. FIRMAR
        return jwt.sign(payload, this.apiSecret, signOptions);
    }

    public getPaymentUrl(token: string): string {
        // Aseguramos que la URL base no tenga slash al final y agregamos el parámetro
        const baseUrl = this.buttonUrl.endsWith('/') ? this.buttonUrl.slice(0, -1) : this.buttonUrl;
        return `${baseUrl}?jwt=${token}`;
    }
}

export const fygaroService = new FygaroService();