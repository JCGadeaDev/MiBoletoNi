'use server';

import { Resend } from 'resend';
import { z } from 'zod';

// 1. Esquema de Validación (Coincide con tu frontend)
const contactSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    orderNumber: z.string().optional(),
    reason: z.string(),
    message: z.string().min(10),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export async function submitContactForm(data: ContactFormValues) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 2. Validar datos en el servidor
    const result = contactSchema.safeParse(data);

    if (!result.success) {
        return { success: false, message: "Datos inválidos." };
    }

    const { name, email, orderNumber, reason, message } = result.data;

    try {
        // 3. ENRUTAMIENTO (Aquí decidimos a dónde va el correo)
        
        // Por defecto, todo va a INFO como pediste
        let targetEmail = 'info@miboletoni.com'; 

        // OPCIONAL: Si es un problema técnico, lo desviamos a soporte
        // (Si prefieres que TODO vaya a info, borra este bloque if)
        if (reason === 'ticket-issue' || reason === 'purchase-doubt') {
            targetEmail = 'soporte@miboletoni.com';
        }

        const reasonLabel = getReasonLabel(reason);

        // 4. Enviar Correo vía Resend
        await resend.emails.send({
            // REMITENTE: Usamos 'noreply' o 'form' (Dominio verificado)
            from: 'Formulario Web <noreply@miboletoni.com>',
            
            // DESTINATARIO: info@ o soporte@ (según lógica arriba)
            to: [targetEmail],
            
            // RESPONDER A: El cliente (para que tú solo des clic en "Responder")
            reply_to: email,
            
            subject: `[Web] ${reasonLabel} - ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; color: #333;">
                    <h2 style="color: #2563eb;">Nuevo Mensaje de Contacto</h2>
                    
                    <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;"><strong>Nombre:</strong> ${name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p style="margin: 5px 0;"><strong>Motivo:</strong> ${reasonLabel}</p>
                        ${orderNumber ? `<p style="margin: 5px 0;"><strong>Orden #:</strong> ${orderNumber}</p>` : ''}
                    </div>

                    <h3>Mensaje:</h3>
                    <p style="white-space: pre-wrap; border-left: 4px solid #ccc; padding-left: 10px;">${message}</p>
                    
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #888;">
                        Enviado al departamento: <strong>${targetEmail}</strong>
                    </p>
                </div>
            `
        });

        return { success: true, message: "Mensaje enviado exitosamente." };

    } catch (error) {
        console.error("Error enviando formulario:", error);
        return { success: false, message: "Hubo un error al enviar el mensaje." };
    }
}

// Helper para traducir los valores del select
function getReasonLabel(reason: string) {
    const map: Record<string, string> = {
        'purchase-doubt': 'Duda sobre Compra',
        'ticket-issue': 'Problema con Boleto',
        'event-info': 'Información de Evento',
        'other': 'Otro / Consulta General'
    };
    return map[reason] || reason;
}