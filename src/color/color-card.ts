import { createCanvas } from '@napi-rs/canvas';
import { DiscordColor } from './colors';

const ROW_WIDTH = 900;
const ROW_HEIGHT = 80;
const GAP = 6;
const PADDING = 20;

const cardCache = new Map<string, Buffer>();

const isLight = (value: number) => {
  const [red, green, blue] = [16, 8, 0].map((shift) => (value >> shift) & 255);
  return 0.299 * red + 0.587 * green + 0.114 * blue > 140;
};

const drawColorCard = (colors: DiscordColor[]) => {
  const canvas = createCanvas(ROW_WIDTH + 2 * GAP, colors.length * (ROW_HEIGHT + GAP) + GAP);
  const context = canvas.getContext('2d');

  context.fillStyle = '#1e1f22';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textBaseline = 'middle';

  colors.forEach(({ name, hex, value }, index) => {
    const y = GAP + index * (ROW_HEIGHT + GAP);
    const textY = y + ROW_HEIGHT / 2;

    context.fillStyle = hex;
    context.fillRect(GAP, y, ROW_WIDTH, ROW_HEIGHT);

    context.fillStyle = isLight(value) ? '#000000' : '#ffffff';
    context.font = 'bold 46px sans-serif';
    context.textAlign = 'left';
    context.fillText(name, GAP + PADDING, textY);
    context.font = '38px sans-serif';
    context.textAlign = 'right';
    context.fillText(hex, GAP + ROW_WIDTH - PADDING, textY);
  });

  return canvas.toBuffer('image/png');
};

export const renderColorCard = (colors: DiscordColor[]) => {
  const key = colors.map(({ name }) => name).join(',');
  const card = cardCache.get(key) ?? drawColorCard(colors);
  cardCache.set(key, card);

  return card;
};
