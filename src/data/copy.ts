/* ============================================================================
 *  COPY — todos los textos de la invitación, en un solo lugar.
 *  Separado de event.config.ts para que los datos duros no se mezclen con la
 *  redacción. Cambiar acá el tono, no dentro de los componentes.
 * ========================================================================== */

export const copy = {
  opening: {
    eyebrow: 'Estás invitado a celebrar',
    cta: 'Abrir invitación',
    hint: 'Una noche muy especial está por comenzar',
  },

  hero: {
    quote: 'Hay noches que se sueñan mucho antes de vivirlas.\nQuiero que esta la vivamos juntos.',
    scrollHint: 'Deslizá',
  },

  intro: {
    label: 'La espera',
    text: 'Durante años imaginé esta noche: la música, la mesa larga, la gente que quiero en un mismo lugar.\nLlegó el momento de celebrar mis quince.',
  },

  countdown: {
    label: 'Falta poco',
    title: 'Cuenta regresiva',
    today: 'Hoy es la noche',
    units: { days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos' },
  },

  agenda: {
    label: 'La noche',
    title: 'Cómo va a ser',
  },

  location: {
    label: 'El lugar',
    title: 'Dónde nos encontramos',
    cta: 'Ver ubicación',
    calendar: 'Agendar la fecha',
  },

  dressCode: {
    label: 'Para la ocasión',
    title: 'Dress code',
  },

  rsvp: {
    label: 'Confirmación',
    title: '¿Nos acompañás?',
    text: 'Tu presencia es lo que va a hacer que esta noche valga la pena.',
    deadline: (d: string) => `Te pido que confirmes antes ${d}.`,
    fields: {
      name: 'Nombre y apellido',
      attending: '¿Vas a venir?',
      yes: 'Sí, ahí estaré',
      no: 'No voy a poder',
      companions: '¿Venís con alguien más?',
      companionsHint: 'Sin contarte a vos',
      dietary: 'Restricción alimentaria',
      dietaryOptions: ['Ninguna', 'Vegetariano', 'Vegano', 'Celíaco', 'Otra'],
      dietaryOther: 'Contame cuál',
    },
    submit: 'Confirmar asistencia',
    submitting: 'Enviando',
    successYes: {
      title: '¡Gracias por confirmar!',
      text: 'Nos vemos el 12 para celebrar juntos.',
    },
    successNo: {
      title: 'Gracias por avisar',
      text: 'Voy a extrañarte esa noche. Gracias por tomarte el momento de responder.',
    },
    errors: {
      name: 'Necesito tu nombre y apellido.',
      attending: 'Contame si vas a poder venir.',
      dietaryOther: 'Contame cuál es la restricción.',
      network: 'No pudimos enviar tu confirmación. Revisá tu conexión e intentá de nuevo.',
      server: 'Algo falló de nuestro lado. Probá otra vez en un minuto.',
      offline: 'Parece que estás sin conexión.',
    },
    whatsapp: 'Confirmar por WhatsApp',
  },

  photos: {
    label: 'Durante la fiesta',
    title: 'Compartamos este recuerdo',
    text: '¿Sacaste una foto o un video esta noche? Sumalo al álbum de mis XV para que no se pierda ninguno de estos momentos.',
    cta: 'Subir fotos y videos',
    note: 'Guardá esta invitación y volvé durante la fiesta para compartir lo que capturaste.',
  },

  closing: {
    text: 'Te espero para compartir una noche inolvidable.',
    signature: 'Guille',
    nav: { location: 'Ubicación', rsvp: 'Confirmar', photos: 'Subir fotos' },
  },

  floatingCta: 'Confirmar asistencia',

  music: {
    on: 'Pausar música',
    off: 'Reproducir música',
    label: 'Música',
  },

  seo: {
    title: 'Mis XV | Guille Chalpe',
    description:
      'Hay noches que se sueñan mucho antes de vivirlas. Te invito a celebrar mis quince el 12 de septiembre. Confirmá tu asistencia acá.',
  },
} as const;
