'use server';

import { adminAuth } from '@/lib/firebase-admin'; // Asegúrate de que este import funcione bien
import { Resend } from 'resend';
import { z } from 'zod';

// Validamos que sea un email real
const resetSchema = z.object({
  email: z.string().email({ message: "Formato de correo inválido" }),
});

export async function sendPasswordResetLink(formData: FormData) {
  const email = formData.get('email') as string;

  // 1. Validar datos
  const result = resetSchema.safeParse({ email });
  if (!result.success) {
    return { success: false, message: "Ingresa un correo válido." };
  }

  // 2. Inicializar Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // 3. Generar Link Seguro con Firebase Admin
    const link = await adminAuth.generatePasswordResetLink(email);

    // 4. Enviar Correo Bonito
    await resend.emails.send({
      from: 'Soporte MiBoletoNi <soporte@miboletoni.com>',
      to: email,
      subject: '🔐 Restablecer contraseña - MiBoletoNi',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb;">Solicitud de Restablecimiento</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para cambiar la contraseña asociada a <strong>${email}</strong>.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>

          <p style="font-size: 13px; color: #666;">
            Si el botón no funciona, copia y pega este enlace:<br>
            <a href="${link}" style="color: #2563eb;">${link}</a>
          </p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">
            Si no solicitaste esto, puedes ignorar este mensaje. Tu cuenta sigue segura.
          </p>
        </div>
      `
    });

    return { success: true, message: "Enlace enviado. Revisa tu correo." };

  } catch (error: any) {
    console.error("❌ Error Reset Password:", error);

    // Si el usuario no existe, Firebase tira error 'auth/user-not-found'.
    // Por seguridad, fingimos éxito.
    if (error.code === 'auth/user-not-found') {
       return { success: true, message: "Si el correo está registrado, recibirás el enlace pronto." };
    }

    return { success: false, message: "Hubo un problema procesando tu solicitud." };
  }
}