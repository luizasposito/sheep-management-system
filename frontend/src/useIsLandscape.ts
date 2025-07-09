
import { useEffect, useState } from "react";

export function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== "undefined" ? window.matchMedia("(orientation: landscape)").matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: landscape)");

    function handler(event: MediaQueryListEvent) {
      setIsLandscape(event.matches);
    }

    mediaQuery.addEventListener
      ? mediaQuery.addEventListener("change", handler)
      : mediaQuery.addListener(handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener
        ? mediaQuery.removeEventListener("change", handler)
        : mediaQuery.removeListener(handler);
    };
  }, []);

  return isLandscape;
}
