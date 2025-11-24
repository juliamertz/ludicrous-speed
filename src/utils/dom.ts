import { Style, Link } from "./element";

export function injectStyles(css: string): void {
  const stylesElement = Style(css).create();
  document.head.appendChild(stylesElement);
}

export function loadStylesheet(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = Link("stylesheet", url)
      .on("load", () => resolve())
      .on("error", () => reject(new Error(`Failed to load stylesheet: ${url}`)))
      .create();
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

  // Use document.createElement directly for custom element names
  const marker = document.createElement(markerName);
  container.appendChild(marker);
  return false;
}

export function removeElements(selector: string, root?: Element): void {
  const elements = (root ?? document).querySelectorAll(selector);
  elements.forEach((el) => el.remove());
}

export function removeClassname(className: string, element?: Element | null) {
  if (element) {
    element.className = element.className
      .split(" ")
      .filter((value) => value !== className)
      .join(" ");
  }
}
