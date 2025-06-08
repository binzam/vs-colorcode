import tinycolor from 'tinycolor2';

type AcceptableFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';
export function isValidColor(input: string): {
  isValid: boolean;
  acceptableColor?: string;
} {
  const color = tinycolor(input);
  if (!color.isValid()) {
    return { isValid: false };
  }
  const format = color.getFormat();
  const acceptableFormats: AcceptableFormat[] = ['hex', 'rgb', 'hsl', 'hsv'];

  if (acceptableFormats.includes(format as AcceptableFormat)) {
    return {
      isValid: true,
      acceptableColor: color.toString(format as AcceptableFormat),
    };
  }

  const alphaFixMap: Record<string, AcceptableFormat> = {
    hex8: 'hex',
    rgba: 'rgb',
    hsla: 'hsl',
    hsva: 'hsv',
  };

  if (format in alphaFixMap) {
    const newFormat = alphaFixMap[format];
    return {
      isValid: true,
      acceptableColor: color.toString(newFormat),
    };
  }

  return { isValid: false };
}
