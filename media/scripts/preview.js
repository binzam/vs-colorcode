(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const shadeBoxes = document.querySelectorAll('.shade-box');

    shadeBoxes.forEach((box) => {
      const label = box.querySelector('.shade-value');
      const originalColor = label.textContent;
      const colorValue = box.getAttribute('data-color');

      box.addEventListener('mouseenter', () => {
        label.textContent = 'Copy';
        label.classList.add('copy-hover');
        label.style.opacity = '1';
      });

      box.addEventListener('mouseleave', () => {
        label.classList.remove('copy-hover');
        label.textContent = originalColor;
        label.style.opacity = '1';
      });

      box.addEventListener('click', () => {
        navigator.clipboard.writeText(colorValue).then(() => {
          label.textContent = 'Copied!';
          label.classList.remove('copy-hover');
          label.classList.add('copied');

          setTimeout(() => {
            label.textContent = originalColor;
            label.classList.remove('copied');
          }, 1000);
        });
      });
    });
  });
})();
