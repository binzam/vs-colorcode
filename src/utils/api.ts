export async function fetchThemes(color: string) {
  try {
    const response = await fetch('http://localhost:3000/themes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ color }),
    }); 
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching themes:', error);
    return [];
  }
}
