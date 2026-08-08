/**
 * Genera /public/og-image.png (1200×630), la imagen que WhatsApp muestra al
 * pegar el link de la invitación.
 *
 *   npm run og
 *
 * Se corre a mano, no en cada build: el resultado es un PNG versionado en el
 * repo, así que el deploy no depende de estas dependencias de desarrollo.
 * Los textos salen de src/data/event.config.ts, así que la portada social
 * siempre coincide con la invitación.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* Los datos se leen del config con una expresión regular simple para no tener
   que compilar TypeScript sólo por esto. */
const config = readFileSync(resolve(root, 'src/data/event.config.ts'), 'utf8');
const field = (name, fallback = '') => {
  const match = config.match(new RegExp(`\\n\\s*${name}:\\s*'([^']*)'`));
  return match ? match[1] : fallback;
};

const CELEBRANT = field('celebrant', 'Guille Chalpe');
const EVENT_TYPE = field('eventType', 'XV');
const MONOGRAM = field('monogram', 'GC');
const DAY = field('dayNumber', '12');
const MONTH = field('monthName', 'Septiembre');
const DATE = `Sábado ${DAY} de ${MONTH}`;

const C = {
  navyDeep: '#0C1E38',
  navy: '#17345C',
  blueLight: '#DCE8F0',
  silver: '#C9D3DC',
  white: '#FFFFFF',
};

const fontDir = resolve(root, 'node_modules/@fontsource/cormorant-garamond/files');
const fonts = [
  {
    name: 'Cormorant',
    data: readFileSync(resolve(fontDir, 'cormorant-garamond-latin-300-normal.woff')),
    weight: 300,
    style: 'normal',
  },
  {
    name: 'Cormorant',
    data: readFileSync(resolve(fontDir, 'cormorant-garamond-latin-400-normal.woff')),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Cormorant',
    data: readFileSync(resolve(fontDir, 'cormorant-garamond-latin-300-italic.woff')),
    weight: 300,
    style: 'italic',
  },
];

/**
 * Helper mínimo: satori acepta el mismo árbol que React, sin necesitar React.
 * Satori exige `display` explícito en todo div con más de un hijo, así que lo
 * ponemos por defecto en vez de repetirlo en cada nodo.
 */
const h = (type, props = {}, children = []) => ({
  type,
  props: { ...props, style: { display: 'flex', ...(props.style ?? {}) }, children },
});

const rule = (width) =>
  h('div', {
    style: {
      display: 'flex',
      width,
      height: '1px',
      background: `linear-gradient(to right, transparent, ${C.silver}, transparent)`,
      opacity: 0.55,
    },
  });

const tree = h(
  'div',
  {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backgroundColor: C.navyDeep,
      backgroundImage: `radial-gradient(700px 420px at 50% 26%, ${C.navy} 0%, ${C.navyDeep} 72%)`,
      fontFamily: 'Cormorant',
    },
  },
  [
    // Marco editorial de 1px
    h('div', {
      style: {
        position: 'absolute',
        top: '30px',
        left: '30px',
        right: '30px',
        bottom: '30px',
        border: `1px solid ${C.silver}`,
        opacity: 0.22,
      },
    }),

    h(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: '300px',
          fontWeight: 400,
          lineHeight: 0.9,
          letterSpacing: '5px',
          color: C.white,
        },
      },
      EVENT_TYPE,
    ),

    h(
      'div',
      {
        style: {
          display: 'flex',
          marginTop: '18px',
          fontSize: '84px',
          fontStyle: 'italic',
          fontWeight: 300,
          color: C.blueLight,
        },
      },
      CELEBRANT,
    ),

    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          marginTop: '34px',
        },
      },
      [
        rule('72px'),
        // El día va un punto más grande: Cormorant usa cifras old-style, que
        // son de altura de x, y al lado de las versales quedarían enanas.
        h(
          'div',
          { style: { color: C.white } },
          [
            h(
              'div',
              { style: { fontSize: '36px', fontWeight: 400, letterSpacing: '3px' } },
              DATE.toUpperCase(),
            ),
          ],
        ),
        rule('72px'),
      ],
    ),
  ],
);

const svg = await satori(tree, { width: 1200, height: 630, fonts });

const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
writeFileSync(resolve(root, 'public/og-image.png'), png);
console.log(`✓ public/og-image.png — 1200×630, ${(png.length / 1024).toFixed(0)} KB`);

/* --- Ícono para "Agregar a pantalla de inicio" en iOS ---------------------- */
const iconSvg = await satori(
  h(
    'div',
    {
      style: {
        width: '180px',
        height: '180px',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.navyDeep,
        fontFamily: 'Cormorant',
      },
    },
    [
      h('div', {
        style: {
          position: 'absolute',
          top: '22px',
          left: '22px',
          width: '136px',
          height: '136px',
          borderRadius: '50%',
          border: `1px solid ${C.silver}`,
          opacity: 0.5,
        },
      }),
      h('div', { style: { fontSize: '62px', letterSpacing: '3px', color: C.white } }, MONOGRAM),
    ],
  ),
  { width: 180, height: 180, fonts },
);

const iconPng = new Resvg(iconSvg, { fitTo: { mode: 'width', value: 180 } }).render().asPng();
writeFileSync(resolve(root, 'public/apple-touch-icon.png'), iconPng);
console.log(`✓ public/apple-touch-icon.png — 180×180, ${(iconPng.length / 1024).toFixed(0)} KB`);
