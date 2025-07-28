 window.addEventListener('load', function () {
      const iframe = document.querySelector('iframe');
      const loader = document.getElementById('loader');

      loader.style.transition = 'opacity 0.5s ease';
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 500);

      setTimeout(() => {
        iframe.style.opacity = '1';
      }, 100);
    });