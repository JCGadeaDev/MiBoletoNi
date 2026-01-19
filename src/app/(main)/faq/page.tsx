
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

const faqs = [
    {
        category: "Proceso de Compra",
        questions: [
            {
                q: "¿Cómo compro boletos en MiBoletoNi?",
                a: "¡Es muy fácil! 1. Elige tu evento. 2. Selecciona la cantidad y tipo de boletos. 3. Haz clic en \"Comprar Boletos\" y sigue los pasos para el pago seguro. 4. ¡Listo! Recibirás tus boletos en tu correo electrónico."
            },
            {
                q: "¿Qué métodos de pago aceptan?",
                a: "Aceptamos las principales tarjetas de crédito y débito (Visa, MasterCard) a través de nuestra pasarela de pago 100% segura."
            },
            {
                q: "¿El precio incluye impuestos y cargos por servicio?",
                a: "El precio final que ves antes de pagar siempre incluye todos los impuestos y cargos por servicio aplicables. No hay sorpresas."
            }
        ]
    },
    {
        category: "Mis Boletos y Acceso al Evento",
        questions: [
            {
                q: "No he recibido el correo con mis boletos, ¿qué hago?",
                a: "Primero, revisa tu carpeta de correo no deseado o \"Spam\". Si no están allí, inicia sesión en tu cuenta de MiBoletoNi, ve a \"Mis Próximos Eventos\" y podrás descargarlos directamente. Si el problema persiste, contáctanos."
            },
            {
                q: "¿Tengo que imprimir mis boletos?",
                a: "Sí. Una vez que recibas tus boletos electrónicos, encontrarás un número de orden. Con ese número, debes acudir a un punto de venta autorizado para canjearlo y recibir tus boletos físicos."
            },
            {
                q: "Compré varios boletos, ¿tenemos que entrar todos juntos?",
                a: "No es necesario. Cada boleto cuenta con su propio código de barras, por lo que una vez que los retires en físico, cada persona podrá ingresar de forma individual con su boleto."
            }
        ]
    },
    {
        category: "Cancelaciones y Reembolsos",
        questions: [
            {
                q: "¿Puedo cancelar mi compra o pedir un reembolso?",
                a: "Como norma general, todas las ventas son finales y no se permiten cancelaciones ni reembolsos. Te recomendamos revisar todos los detalles antes de confirmar tu compra."
            },
            {
                q: "¿Qué pasa si el evento se cancela o se pospone?",
                a: "Si un evento es cancelado, el organizador es responsable de la política de reembolso. MiBoletoNi seguirá las instrucciones del organizador y te notificaremos por correo electrónico sobre los pasos a seguir para solicitar la devolución de tu dinero. Si el evento se pospone, no se realizarán devoluciones, ya que el evento sigue en pie y tus boletos actuales serán válidos para la nueva fecha. En caso de que el cliente no pueda asistir a la reprogramación, deberá gestionar la reventa o transferencia de sus boletos por cuenta propia, ya que ni MiBoletoNi ni el organizador realizarán reembolsos en estos casos."
            }
        ]
    }
]

const heroImage = PlaceHolderImages.find(p => p.id === 'faq-hero');

export default function FAQPage() {
  return (
    <>
      <section className="relative py-20 md:py-28 bg-secondary">
        {heroImage && (
            <Image 
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/30" />
        <div className="container relative text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
            Preguntas Frecuentes
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            ¡Resolvemos tus dudas al instante! Encuentra aquí las respuestas a las consultas más habituales.
            </p>
        </div>
      </section>
      <div className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {faqs.map((category, index) => (
              <div key={index} className="mb-12">
                  <h2 className="font-headline text-2xl font-semibold mb-6 border-b pb-2">{category.category}</h2>
                  <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, qIndex) => (
                          <AccordionItem value={`item-${index}-${qIndex}`} key={qIndex}>
                              <AccordionTrigger className="text-lg text-left">{faq.q}</AccordionTrigger>
                              <AccordionContent className="text-base text-muted-foreground text-justify">
                                  {faq.a}
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                  </Accordion>
              </div>
          ))}
        </div>
      </div>
    </>
  );
}
