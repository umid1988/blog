// Adds a "Copy" button to every code block.
document.addEventListener('DOMContentLoaded', () => {
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
});
