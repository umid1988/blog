// Small progressive enhancements. The site works without this file.
document.addEventListener('DOMContentLoaded', () => {
  addCopyButtons();
  addImageZoom();
  trackContents();
});

// "Copy" button on every code block.
function addCopyButtons() {
  if (!navigator.clipboard) return;

  document.querySelectorAll('.prose pre').forEach((pre) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'codeblock';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    button.addEventListener('click', async () => {
      const code = pre.querySelector('code') || pre;
      try {
        await navigator.clipboard.writeText(code.innerText);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy failed';
      }
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 1800);
    });

    wrapper.appendChild(button);
  });
}

// Click a screenshot to see it full size.
function addImageZoom() {
  const images = [...document.querySelectorAll('.prose img')].filter((img) => !img.closest('a'));
  if (images.length === 0 || typeof HTMLDialogElement !== 'function') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Enlarged image');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'lightbox__close';
  close.textContent = 'Close';

  const big = document.createElement('img');
  big.decoding = 'async';

  dialog.append(close, big);
  document.body.appendChild(dialog);

  close.addEventListener('click', () => dialog.close());
  // Clicking the image or the dimmed backdrop closes it too.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === big) dialog.close();
  });

  images.forEach((img) => {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'zoom';
    trigger.setAttribute('aria-label', `Enlarge image${img.alt ? `: ${img.alt}` : ''}`);
    img.parentNode.insertBefore(trigger, img);
    trigger.appendChild(img);

    trigger.addEventListener('click', () => {
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      dialog.showModal();
      close.focus();
    });
  });
}

// Highlight the current section in the side contents list.
function trackContents() {
  const links = [...document.querySelectorAll('[data-toc-link]')];
  if (links.length === 0) return;

  const headings = links
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter(Boolean);
  let ticking = false;

  const update = () => {
    ticking = false;
    let current = 0;
    headings.forEach((heading, i) => {
      if (heading.getBoundingClientRect().top <= 140) current = i;
    });
    links.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}
