export class PostRenderStep {
    run(navigationInstruction, next) {
        let element = document.getElementsByTagName('body')[0];
        
        smoothScrollReset(element);
        return next();
    }
}

export function smoothScrollReset(element) {
    if (!element) {
      return;
    }
  
    const duration = 200;
    const scrollFrom = element.scrollTop;
    const diff = -scrollFrom;
    let startTime = null;
    let lastYOffset;
    let scrollLoop = (currentTime) => {
      let currentYOffset = element.scrollTop;
      if (!startTime) {
        startTime = currentTime - 1;
      }
  
      const timeElapsed = currentTime - startTime;
      if (lastYOffset) {
        if ((diff > 0 && lastYOffset > currentYOffset) ||
          (diff < 0 && lastYOffset < currentYOffset)) {
          return;
        }
      }
  
      lastYOffset = currentYOffset;
      element.scrollTop = linearTween(timeElapsed, scrollFrom, diff, duration);
      if (timeElapsed < duration) {
        window.requestAnimationFrame(scrollLoop);
      } else {
        element.scrollTop = 0;
      }
    };
  
    window.requestAnimationFrame(scrollLoop);
  }
  
  function linearTween(t, b, c, d) {
    return c * t / d + b;
  }
