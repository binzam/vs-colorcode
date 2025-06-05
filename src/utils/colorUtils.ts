export function getContrastColor(hexcolor: string): 'black' | 'white' {
  hexcolor = hexcolor.replace('#', '');

  if (hexcolor.length === 3) {
    hexcolor = hexcolor
      .split('')
      .map((x) => x + x)
      .join('');
  }

  const r = parseInt(hexcolor.slice(0, 2), 16);
  const g = parseInt(hexcolor.slice(2, 4), 16);
  const b = parseInt(hexcolor.slice(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

export function isValidColor(color: string): boolean {
  return /^(#([0-9A-Fa-f]{3}){1,2}|(rgb|hsl)a?\(\s*\d+\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*(,\s*[\d.]+\s*)?\))$/.test(
    color
  );
}
