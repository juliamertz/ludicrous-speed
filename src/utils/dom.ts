export function injectStyles(css: string): void {
  const stylesElement = document.createElement("style");
  stylesElement.innerHTML = css;
  document.head.appendChild(stylesElement);
}

export function loadStylesheet(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
    document.head.appendChild(link);
  });
}

export function preventDoubleRun(
  container: Element,
  markerName: string = "has-run",
): boolean {
  try {
    const hasRun = container.querySelector(markerName);
    if (hasRun) {
      return true;
    }
  } catch (e) {
    // Ignore errors
  }

  const marker = document.createElement(markerName);
  container.appendChild(marker);
  return false;
}

export function removeElements(selector: string): void {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.remove());
}
