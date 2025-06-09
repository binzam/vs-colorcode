(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const bgPicker = document.getElementById('bg-picker');
    const themeContainer = document.getElementById('themeContainer');
    const swatchWrappers = document.querySelectorAll('.swatch-label-wrapper');
    const themeHeader = document.querySelectorAll('.theme-header');
    const themeBlockBorder = document.querySelectorAll('.theme-row');

    themeContainer.style.background = '#ffffff';
    function getLuminance(color) {
      const rgb = color.match(/\w\w/g)?.map((c) => parseInt(c, 16) / 255);
      if (!rgb) {
        return 0;
      }
      return rgb
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
        .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
    }

    function getContrastColor(bgColor) {
      return getLuminance(bgColor) > 0.5 ? '#000000' : '#ffffff';
    }
    bgPicker.addEventListener('input', (e) => {
      const newBgColor = e.target.value;
      themeContainer.style.background = newBgColor;
      const contrastColor = getContrastColor(newBgColor);
      const boxShadow =
        contrastColor === '#000000'
          ? '0 2px 6px rgba(255, 255, 255, 0.5)'
          : '0 2px 6px rgba(0, 0, 0, 0.5)';
      const borderColor =
        contrastColor === '#000000'
          ? '3px solid rgba(30, 30, 30, 0.5)'
          : '3px solid rgba(255, 255, 255, 0.5)';

      swatchWrappers.forEach((wrapper) => {
        wrapper.style.background = contrastColor;
        wrapper.style.color = newBgColor;
        wrapper.style.boxShadow = boxShadow;
      });

      themeHeader.forEach((header) => {
        header.style.background = contrastColor;
        header.style.color = newBgColor;
        header.style.boxShadow = boxShadow;
      });
      themeBlockBorder.forEach((block) => {
        block.style.borderBottom = borderColor;
      });
    });

    swatchWrappers.forEach((wrapper) => {
      const overlay = wrapper.querySelector('.swatch-overlay');
      const colorValue = wrapper.getAttribute('data-color');

      wrapper.addEventListener('mouseenter', () => {
        // overlay.textContent = `Copy ${colorValue}`;
        overlay.textContent = `Copy`;
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
              // overlay.textContent = `Copy ${colorValue}`;
              overlay.textContent = `Copy`;
            }, 1000);
          })
          .catch((err) => console.error('Failed to copy:', err));
      });
    });
  });
})();
