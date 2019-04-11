export class PreRenderStep {
    run(navigationInstruction, next) {
      let currentRoute = navigationInstruction.config;
  
      let currentRouteName = currentRoute.name;
  
      document.body.className = '';
      document.body.classList.add(`route--${currentRouteName}`);
      
      return next();
    }
}
