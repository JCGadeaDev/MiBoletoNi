
'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const emailSchema = z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' });

// Initialize Resend safely for development
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  const email = formData.get('email');

  const validation = emailSchema.safeParse(email);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }

  const validatedEmail = validation.data;

  try {
    const subscribersRef = adminDb.collection('newsletterSubscribers');
    const existingSubscriberQuery = await subscribersRef.where('email', '==', validatedEmail).limit(1).get();

    if (!existingSubscriberQuery.empty) {
      return {
        success: false,
        message: 'Este correo electrónico ya está suscrito.',
      };
    }

    await subscribersRef.add({
      email: validatedEmail,
      subscribedAt: FieldValue.serverTimestamp(),
    });

    // Enviar correo de bienvenida
    if (resend) {
      await resend.emails.send({
        from: 'MiBoletoNi <onboarding@resend.dev>', // Debe ser un dominio verificado
        to: [validatedEmail],
        subject: '¡Bienvenido al boletín de MiBoletoNi!',
        html: `
                <h1>¡Gracias por suscribirte!</h1>
                <p>Estás oficialmente en la lista para recibir las últimas noticias sobre los mejores eventos, ofertas exclusivas y mucho más, directamente en tu bandeja de entrada.</p>
                <p>¡Prepárate para tu próxima experiencia inolvidable!</p>
                <br>
                <p>El equipo de MiBoletoNi</p>
            `,
      });
    } else {
      console.warn("Resend API Key missing. Skipping email send.");
    }

    return {
      success: true,
      message: '¡Gracias por suscribirte! Te hemos enviado un correo de bienvenida.',
    };

  } catch (error) {
    console.error("Error al suscribir al boletín:", error);
    return {
      success: false,
      message: 'Ocurrió un error en el servidor. Por favor, intenta de nuevo más tarde.',
    };
  }
}
