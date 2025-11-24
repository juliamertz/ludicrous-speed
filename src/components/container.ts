import { Div, H3, Span } from "../utils/element";

export interface ContainerOptions {
  title?: string;
  titleCount?: number;
  className?: string;
  id?: string;
  spanColumns?: number;
  minHeight?: string;
}

export function createContainer(options: ContainerOptions = {}): HTMLElement {
  const containerBuilder = Div().class("dashboard-item");

  if (options.className) {
    containerBuilder.class(options.className);
  }

  if (options.id) {
    containerBuilder.id(options.id);
  }

  if (options.spanColumns === 2) {
    containerBuilder.class("dashboard-item--span-2");
  }

  if (options.minHeight) {
    containerBuilder.style("minHeight", options.minHeight);
  }

  if (options.title) {
    const titleBuilder = H3().class("dashboard-item__title");

    if (options.titleCount !== undefined) {
      titleBuilder.children(
        Span(options.title),
        Span(` (${options.titleCount})`).class("dashboard-item__title-count"),
      );
    } else {
      titleBuilder.text(options.title);
    }

    containerBuilder.children(titleBuilder);
  }

  return containerBuilder.create();
}

export function createContainerWithContent(
  options: ContainerOptions,
  content: HTMLElement | HTMLElement[],
): HTMLElement {
  const containerBuilder = Div().class("dashboard-item");

  if (options.className) {
    containerBuilder.class(options.className);
  }

  if (options.id) {
    containerBuilder.id(options.id);
  }

  if (options.spanColumns === 2) {
    containerBuilder.class("dashboard-item--span-2");
  }

  if (options.minHeight) {
    containerBuilder.style("minHeight", options.minHeight);
  }

  if (options.title) {
    const titleBuilder = H3().class("dashboard-item__title");

    if (options.titleCount !== undefined) {
      titleBuilder.children(
        Span(options.title),
        Span(` (${options.titleCount})`).class("dashboard-item__title-count"),
      );
    } else {
      titleBuilder.text(options.title);
    }

    containerBuilder.children(titleBuilder);
  }

  if (Array.isArray(content)) {
    containerBuilder.children(...content);
  } else {
    containerBuilder.children(content);
  }

  return containerBuilder.create();
}
