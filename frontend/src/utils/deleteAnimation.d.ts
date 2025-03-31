export function runDeleteAnimation(buttonEl) {
    // This toggles the data-running attribute, which triggers your CSS keyframes
    buttonEl.setAttribute('data-running', 'true');
  
    // After the animation ends (2s?), we can reset
    setTimeout(() => {
      buttonEl.setAttribute('data-running', 'false');
    }, 2000);
  }