import { Div } from "./element";

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
  const containerBuilder = Div();

  if (options.className) {
    containerBuilder.class(options.className);
  }

  if (options.type === "grid") {
    containerBuilder.style("display", "grid");
    const gridOptions = options.grid || {};

    if (gridOptions.columns) {
      if (typeof gridOptions.columns === "number") {
        containerBuilder.style("gridTemplateColumns", `repeat(${gridOptions.columns}, 1fr)`);
      } else {
        containerBuilder.style("gridTemplateColumns", `repeat(${gridOptions.columns}, minmax(0, 1fr))`);
      }
    }

    if (gridOptions.gap) {
      containerBuilder.style("gap", gridOptions.gap);
    }

    if (gridOptions.padding) {
      containerBuilder.style("padding", gridOptions.padding);
    }
  } else if (options.type === "flex") {
    containerBuilder.style("display", "flex");
    const flexOptions = options.flex || {};

    if (flexOptions.direction) {
      containerBuilder.style("flexDirection", flexOptions.direction);
    }

    if (flexOptions.justify) {
      containerBuilder.style("justifyContent", flexOptions.justify);
    }

    if (flexOptions.align) {
      containerBuilder.style("alignItems", flexOptions.align);
    }

    if (flexOptions.gap) {
      containerBuilder.style("gap", flexOptions.gap);
    }

    if (flexOptions.wrap !== undefined) {
      containerBuilder.style("flexWrap", flexOptions.wrap ? "wrap" : "nowrap");
    }
  }

  return containerBuilder.create();
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
