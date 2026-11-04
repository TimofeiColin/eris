import { Color, ColorSchema } from '../schemas/color.schema';
import { ColorGroup, ColorGroupSchema } from '../schemas/color-group.schema';
import { DatabaseMigration } from '../umzug';

const DISCORD_COLOR_GROUPS = [
  {
    name: 'Red',
    colors: [
      { name: 'Red', hex: '#FF0000' },
      { name: 'Crimson', hex: '#DC143C' },
      { name: 'FireBrick', hex: '#B22222' },
      { name: 'DarkRed', hex: '#8B0000' },
      { name: 'IndianRed', hex: '#CD5C5C' },
      { name: 'LightCoral', hex: '#F08080' },
      { name: 'Salmon', hex: '#FA8072' },
      { name: 'DarkSalmon', hex: '#E9967A' },
      { name: 'LightSalmon', hex: '#FFA07A' },
    ],
  },
  {
    name: 'Orange',
    colors: [
      { name: 'Orange', hex: '#FFA500' },
      { name: 'DarkOrange', hex: '#FF8C00' },
      { name: 'Coral', hex: '#FF7F50' },
      { name: 'Tomato', hex: '#FF6347' },
      { name: 'OrangeRed', hex: '#FF4500' },
    ],
  },
  {
    name: 'Yellow',
    colors: [
      { name: 'Yellow', hex: '#FFFF00' },
      { name: 'Gold', hex: '#FFD700' },
      { name: 'LightYellow', hex: '#FFFFE0' },
      { name: 'LemonChiffon', hex: '#FFFACD' },
      { name: 'LightGoldenRodYellow', hex: '#FAFAD2' },
      { name: 'PapayaWhip', hex: '#FFEFD5' },
      { name: 'Moccasin', hex: '#FFE4B5' },
      { name: 'PeachPuff', hex: '#FFDAB9' },
      { name: 'PaleGoldenRod', hex: '#EEE8AA' },
      { name: 'Khaki', hex: '#F0E68C' },
      { name: 'DarkKhaki', hex: '#BDB76B' },
    ],
  },
  {
    name: 'Green',
    colors: [
      { name: 'Lime', hex: '#00FF00' },
      { name: 'Green', hex: '#008000' },
      { name: 'GreenYellow', hex: '#ADFF2F' },
      { name: 'Chartreuse', hex: '#7FFF00' },
      { name: 'LawnGreen', hex: '#7CFC00' },
      { name: 'LimeGreen', hex: '#32CD32' },
      { name: 'PaleGreen', hex: '#98FB98' },
      { name: 'LightGreen', hex: '#90EE90' },
      { name: 'MediumSpringGreen', hex: '#00FA9A' },
      { name: 'SpringGreen', hex: '#00FF7F' },
      { name: 'MediumSeaGreen', hex: '#3CB371' },
      { name: 'SeaGreen', hex: '#2E8B57' },
      { name: 'ForestGreen', hex: '#228B22' },
      { name: 'DarkGreen', hex: '#006400' },
      { name: 'YellowGreen', hex: '#9ACD32' },
      { name: 'OliveDrab', hex: '#6B8E23' },
      { name: 'Olive', hex: '#808000' },
      { name: 'DarkOliveGreen', hex: '#556B2F' },
      { name: 'MediumAquaMarine', hex: '#66CDAA' },
      { name: 'DarkSeaGreen', hex: '#8FBC8F' },
      { name: 'LightSeaGreen', hex: '#20B2AA' },
      { name: 'DarkCyan', hex: '#008B8B' },
      { name: 'Teal', hex: '#008080' },
    ],
  },
  {
    name: 'Cyan',
    colors: [
      { name: 'Cyan', hex: '#00FFFF' },
      { name: 'Aqua', hex: '#00FFFF' },
      { name: 'LightCyan', hex: '#E0FFFF' },
      { name: 'PaleTurquoise', hex: '#AFEEEE' },
      { name: 'Aquamarine', hex: '#7FFFD4' },
      { name: 'Turquoise', hex: '#40E0D0' },
      { name: 'MediumTurquoise', hex: '#48D1CC' },
      { name: 'DarkTurquoise', hex: '#00CED1' },
    ],
  },
  {
    name: 'Blue',
    colors: [
      { name: 'Blue', hex: '#0000FF' },
      { name: 'RoyalBlue', hex: '#4169E1' },
      { name: 'DodgerBlue', hex: '#1E90FF' },
      { name: 'DeepSkyBlue', hex: '#00BFFF' },
      { name: 'CornflowerBlue', hex: '#6495ED' },
      { name: 'SteelBlue', hex: '#4682B4' },
      { name: 'CadetBlue', hex: '#5F9EA0' },
      { name: 'LightSteelBlue', hex: '#B0C4DE' },
      { name: 'LightBlue', hex: '#ADD8E6' },
      { name: 'PowderBlue', hex: '#B0E0E6' },
      { name: 'LightSkyBlue', hex: '#87CEFA' },
      { name: 'SkyBlue', hex: '#87CEEB' },
      { name: 'MediumBlue', hex: '#0000CD' },
      { name: 'DarkBlue', hex: '#00008B' },
      { name: 'Navy', hex: '#000080' },
      { name: 'MidnightBlue', hex: '#191970' },
    ],
  },
  {
    name: 'Purple',
    colors: [
      { name: 'Purple', hex: '#800080' },
      { name: 'RebeccaPurple', hex: '#663399' },
      { name: 'Indigo', hex: '#4B0082' },
      { name: 'Lavender', hex: '#E6E6FA' },
      { name: 'Thistle', hex: '#D8BFD8' },
      { name: 'Plum', hex: '#DDA0DD' },
      { name: 'Orchid', hex: '#DA70D6' },
      { name: 'Violet', hex: '#EE82EE' },
      { name: 'Fuchsia', hex: '#FF00FF' },
      { name: 'Magenta', hex: '#FF00FF' },
      { name: 'MediumOrchid', hex: '#BA55D3' },
      { name: 'DarkOrchid', hex: '#9932CC' },
      { name: 'DarkViolet', hex: '#9400D3' },
      { name: 'BlueViolet', hex: '#8A2BE2' },
      { name: 'DarkMagenta', hex: '#8B008B' },
      { name: 'MediumPurple', hex: '#9370DB' },
      { name: 'MediumSlateBlue', hex: '#7B68EE' },
      { name: 'SlateBlue', hex: '#6A5ACD' },
      { name: 'DarkSlateBlue', hex: '#483D8B' },
    ],
  },
  {
    name: 'Pink',
    colors: [
      { name: 'HotPink', hex: '#FF69B4' },
      { name: 'Pink', hex: '#FFC0CB' },
      { name: 'LightPink', hex: '#FFB6C1' },
      { name: 'DeepPink', hex: '#FF1493' },
      { name: 'PaleVioletRed', hex: '#DB7093' },
      { name: 'MediumVioletRed', hex: '#C71585' },
    ],
  },
  {
    name: 'Brown',
    colors: [
      { name: 'SaddleBrown', hex: '#8B4513' },
      { name: 'Brown', hex: '#A52A2A' },
      { name: 'Sienna', hex: '#A0522D' },
      { name: 'Chocolate', hex: '#D2691E' },
      { name: 'Peru', hex: '#CD853F' },
      { name: 'DarkGoldenRod', hex: '#B8860B' },
      { name: 'GoldenRod', hex: '#DAA520' },
      { name: 'SandyBrown', hex: '#F4A460' },
      { name: 'RosyBrown', hex: '#BC8F8F' },
      { name: 'Tan', hex: '#D2B48C' },
      { name: 'BurlyWood', hex: '#DEB887' },
      { name: 'Wheat', hex: '#F5DEB3' },
      { name: 'NavajoWhite', hex: '#FFDEAD' },
      { name: 'Bisque', hex: '#FFE4C4' },
      { name: 'BlanchedAlmond', hex: '#FFEBCD' },
      { name: 'Cornsilk', hex: '#FFF8DC' },
      { name: 'Maroon', hex: '#800000' },
    ],
  },
  {
    name: 'White',
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Snow', hex: '#FFFAFA' },
      { name: 'HoneyDew', hex: '#F0FFF0' },
      { name: 'MintCream', hex: '#F5FFFA' },
      { name: 'Azure', hex: '#F0FFFF' },
      { name: 'AliceBlue', hex: '#F0F8FF' },
      { name: 'GhostWhite', hex: '#F8F8FF' },
      { name: 'WhiteSmoke', hex: '#F5F5F5' },
      { name: 'SeaShell', hex: '#FFF5EE' },
      { name: 'Beige', hex: '#F5F5DC' },
      { name: 'OldLace', hex: '#FDF5E6' },
      { name: 'FloralWhite', hex: '#FFFAF0' },
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'AntiqueWhite', hex: '#FAEBD7' },
      { name: 'Linen', hex: '#FAF0E6' },
      { name: 'LavenderBlush', hex: '#FFF0F5' },
      { name: 'MistyRose', hex: '#FFE4E1' },
    ],
  },
  {
    name: 'Gray',
    colors: [
      { name: 'Gray', hex: '#808080' },
      { name: 'Grey', hex: '#808080' },
      { name: 'Gainsboro', hex: '#DCDCDC' },
      { name: 'LightGray', hex: '#D3D3D3' },
      { name: 'LightGrey', hex: '#D3D3D3' },
      { name: 'Silver', hex: '#C0C0C0' },
      { name: 'DarkGray', hex: '#A9A9A9' },
      { name: 'DarkGrey', hex: '#A9A9A9' },
      { name: 'DimGray', hex: '#696969' },
      { name: 'DimGrey', hex: '#696969' },
      { name: 'LightSlateGray', hex: '#778899' },
      { name: 'LightSlateGrey', hex: '#778899' },
      { name: 'SlateGray', hex: '#708090' },
      { name: 'SlateGrey', hex: '#708090' },
      { name: 'DarkSlateGray', hex: '#2F4F4F' },
      { name: 'DarkSlateGrey', hex: '#2F4F4F' },
      { name: 'Black', hex: '#000000' },
    ],
  },
];

export const seedColors: DatabaseMigration = {
  name: '001-colors',
  async up({ context: connection }) {
    const groupModel = connection.model(ColorGroup.name, ColorGroupSchema);
    const colorModel = connection.model(Color.name, ColorSchema);

    const groups = DISCORD_COLOR_GROUPS.map(({ name }, index) => ({ _id: index + 1, name }));
    const colors = DISCORD_COLOR_GROUPS.flatMap(({ colors }, index) =>
      colors.map(({ name, hex }) => ({ name, hex, group: index + 1 })),
    ).map((color, index) => ({ _id: index + 1, ...color }));

    await groupModel.bulkWrite(
      groups.map(({ _id, name }) => ({ updateOne: { filter: { _id }, update: { name }, upsert: true } })),
    );
    await colorModel.bulkWrite(
      colors.map(({ _id, ...color }) => ({ updateOne: { filter: { _id }, update: color, upsert: true } })),
    );
  },
  async down({ context: connection }) {
    await connection.model(Color.name, ColorSchema).deleteMany({});
    await connection.model(ColorGroup.name, ColorGroupSchema).deleteMany({});
  },
};
