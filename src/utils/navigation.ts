import { router as expoRouter } from "expo-router";

const NAVIGATION_GUARD_WINDOW_MS = 600;

let lastNavigationAt = 0;

function guard<Args extends unknown[]>(
  fn: (...args: Args) => void,
): (...args: Args) => void {
  return (...args: Args) => {
    const now = Date.now();
    if (now - lastNavigationAt < NAVIGATION_GUARD_WINDOW_MS) {
      return;
    }
    lastNavigationAt = now;
    fn(...args);
  };
}

export const router: typeof expoRouter = {
  ...expoRouter,
  push: guard(expoRouter.push),
  replace: guard(expoRouter.replace),
  navigate: guard(expoRouter.navigate),
  back: guard(expoRouter.back),
  dismiss: guard(expoRouter.dismiss),
  dismissTo: guard(expoRouter.dismissTo),
  dismissAll: guard(expoRouter.dismissAll),
};
