export function isValidColor(color: string): boolean {
  return /^(#([0-9A-Fa-f]{3}){1,2}|(rgb|hsl)a?\(\s*\d+\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*(,\s*[\d.]+\s*)?\))$/.test(
    color
  );
}
