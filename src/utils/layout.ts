export type LayoutType = "grid" | "flex";
export type GridColumns = number | "auto-fit" | "auto-fill";

export interface GridLayoutOptions {
  columns?: GridColumns;
  gap?: string;
  padding?: string;
}

export interface FlexLayoutOptions {
  direction?: "row" | "column";
  justify?: string;
  align?: string;
  gap?: string;
  wrap?: boolean;
}

export interface LayoutOptions {
  type: LayoutType;
  grid?: GridLayoutOptions;
  flex?: FlexLayoutOptions;
  className?: string;
}

export function createLayoutContainer(options: LayoutOptions): HTMLElement {
  const container = document.createElement("div");

  if (options.className) {
    container.classList.add(options.className);
  }

  if (options.type === "grid") {
    container.style.display = "grid";
    const gridOptions = options.grid || {};

    if (gridOptions.columns) {
      if (typeof gridOptions.columns === "number") {
        container.style.gridTemplateColumns = `repeat(${gridOptions.columns}, 1fr)`;
      } else {
        container.style.gridTemplateColumns = `repeat(${gridOptions.columns}, minmax(0, 1fr))`;
      }
    }

    if (gridOptions.gap) {
      container.style.gap = gridOptions.gap;
    }

    if (gridOptions.padding) {
      container.style.padding = gridOptions.padding;
    }
  } else if (options.type === "flex") {
    container.style.display = "flex";
    const flexOptions = options.flex || {};

    if (flexOptions.direction) {
      container.style.flexDirection = flexOptions.direction;
    }

    if (flexOptions.justify) {
      container.style.justifyContent = flexOptions.justify;
    }

    if (flexOptions.align) {
      container.style.alignItems = flexOptions.align;
    }

    if (flexOptions.gap) {
      container.style.gap = flexOptions.gap;
    }

    if (flexOptions.wrap !== undefined) {
      container.style.flexWrap = flexOptions.wrap ? "wrap" : "nowrap";
    }
  }

  return container;
}

type Grid = {
  columns?: number;
  gap?: string;
  padding?: string;
};

export function createGridContainer(
  { columns, gap, padding }: Grid = {
    columns: 1,
    gap: "12px",
    padding: "0 6px",
  },
): HTMLElement {
  return createLayoutContainer({
    type: "grid",
    className: "dashboard-container",
    grid: {
      columns,
      gap,
      padding,
    },
  });
}
