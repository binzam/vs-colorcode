document.addEventListener('DOMContentLoaded', () => {
  const swatchWrappers = document.querySelectorAll('.swatch-label-wrapper');
  const bgPicker = document.getElementById('bg-picker');
  const themeContainer = document.getElementById('themeContainer');
  themeContainer.style.background = '#ffffff';
  bgPicker.addEventListener('input', (e) => {
    themeContainer.style.background = e.target.value;
  });

  swatchWrappers.forEach((wrapper) => {
    const overlay = wrapper.querySelector('.swatch-overlay');
    const colorValue = wrapper.getAttribute('data-color');

    wrapper.addEventListener('mouseenter', () => {
      overlay.textContent = `Copy ${colorValue}`;
      overlay.style.opacity = '1';
    });

    wrapper.addEventListener('mouseleave', () => {
      overlay.style.opacity = '0';
    });

    wrapper.addEventListener('click', () => {
      navigator.clipboard
        .writeText(colorValue)
        .then(() => {
          overlay.textContent = 'Copied!';
          setTimeout(() => {
            overlay.textContent = `Copy ${colorValue}`;
          }, 1000);
        })
        .catch((err) => console.error('Failed to copy:', err));
    });
  });
});
