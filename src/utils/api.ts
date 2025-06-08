import { Theme, ThemeCollection } from './types';
interface ApiResponse {
  success: boolean;
  mainColor: string;
  themes: Theme[];
}
export async function fetchThemes(color: string): Promise<ThemeCollection> {
  try {
    const response = await fetch('http://localhost:3000/api/themes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ color }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!isApiResponse(data)) {
      throw new Error('Invalid response structure from server');
    }

    return {
      mainColor: data.mainColor,
      themes: data.themes,
    };
  } catch (error) {
    console.error('Error fetching themes:', error);
    return {
      mainColor: color,
      themes: [],
    };
  }
}

function isApiResponse(data: unknown): data is ApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof data.success === 'boolean' &&
    'mainColor' in data &&
    typeof data.mainColor === 'string' &&
    'themes' in data &&
    Array.isArray(data.themes)
  );
}
