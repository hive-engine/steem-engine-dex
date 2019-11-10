export class PreRenderStep {
    run(navigationInstruction, next) {
      const currentRoute = navigationInstruction.config;
  
      const currentRouteName = currentRoute.name;
  
      document.body.className = '';
      document.body.classList.add(`route--${currentRouteName}`);
      
      return next();
    }
}
