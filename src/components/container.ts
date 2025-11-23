export interface ContainerOptions {
  title?: string;
  titleCount?: number;
  className?: string;
  id?: string,
  spanColumns?: number;
  minHeight?: string;
}

export function createContainer(options: ContainerOptions = {}): HTMLElement {
  const container = document.createElement("div");
  container.classList.add("dashboard-item");

  if (options.className) {
    container.classList.add(options.className);
  }

  if (options.id) {
    container.id = options.id
  }

  if (options.spanColumns === 2) {
    container.classList.add("dashboard-item--span-2");
  }

  if (options.minHeight) {
    container.style.minHeight = options.minHeight;
  }

  if (options.title) {
    const title = document.createElement("h3");
    title.classList.add("dashboard-item__title");

    let titleText = options.title;
    if (options.titleCount !== undefined) {
      titleText += ` <span class="dashboard-item__title-count">(${options.titleCount})</span>`;
    }

    title.innerHTML = titleText;
    container.appendChild(title);
  }

  return container;
}

export function createContainerWithContent(
  options: ContainerOptions,
  content: HTMLElement | HTMLElement[],
): HTMLElement {
  const container = createContainer(options);

  if (Array.isArray(content)) {
    content.forEach((item) => container.appendChild(item));
  } else {
    container.appendChild(content);
  }

  return container;
}
