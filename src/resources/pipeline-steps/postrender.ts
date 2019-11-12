export class PostRenderStep {
    run(navigationInstruction, next) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return next();
    }
}
