type TagName = keyof HTMLElementTagNameMap;
type ElementType<T extends TagName> = HTMLElementTagNameMap[T];

export class ElementBuilder<T extends TagName> {
  tag: T;
  childNodes: Array<Element>;
  innerText?: string;
  innerHTML?: string;
  classNames: Array<string>;
  styleMap: Map<string, string>;
  attributes: Map<string, string>;
  eventListeners: Map<string, EventListener>;

  constructor(tag: T) {
    this.tag = tag;
    this.childNodes = [];
    this.classNames = [];
    this.styleMap = new Map();
    this.attributes = new Map();
    this.eventListeners = new Map();
  }

  children(...nodes: (Element | ElementBuilder<any>)[]): ElementBuilder<T> {
    nodes.forEach((node) => {
      if (node instanceof ElementBuilder) {
        this.childNodes.push(node.create());
      } else {
        this.childNodes.push(node);
      }
    });
    return this;
  }

  class(...names: (string | undefined)[]): ElementBuilder<T> {
    names
      .filter((v) => !!v)
      .forEach((className) => {
        this.classNames.push(className as string);
      });
    return this;
  }

  style(key: keyof CSSStyleDeclaration, value: string): ElementBuilder<T> {
    this.styleMap.set(key as string, value);
    return this;
  }

  styles(styleObj: Partial<CSSStyleDeclaration>): ElementBuilder<T> {
    Object.entries(styleObj).forEach(([key, value]) => {
      if (value !== undefined) {
        this.styleMap.set(key, value as string);
      }
    });
    return this;
  }

  attr(key: string, value: string): ElementBuilder<T> {
    this.attributes.set(key, value);
    return this;
  }

  id(id: string): ElementBuilder<T> {
    return this.attr("id", id);
  }

  on(event: string, handler: EventListener): ElementBuilder<T> {
    this.eventListeners.set(event, handler);
    return this;
  }

  onClick(handler: EventListener): ElementBuilder<T> {
    return this.on("click", handler);
  }

  text(text: string): ElementBuilder<T> {
    this.innerText = text;
    return this;
  }

  html(html: string): ElementBuilder<T> {
    this.innerText = undefined;
    this.innerHTML = undefined;
    this.childNodes = [];
    const temp = document.createElement("div");
    temp.innerHTML = html;
    Array.from(temp.children).forEach((child) => {
      this.childNodes.push(child as Element);
    });
    return this;
  }

  innerHTMLContent(html: string): ElementBuilder<T> {
    this.innerText = undefined;
    this.innerHTML = html;
    this.childNodes = [];
    return this;
  }

  create(): ElementType<T> {
    const element = document.createElement(this.tag);

    if (this.classNames.length > 0) {
      element.className = this.classNames.join(" ");
    }

    this.styleMap.forEach((value, key) => {
      (element.style as any)[key] = value;
    });

    this.attributes.forEach((value, key) => {
      element.setAttribute(key, value);
    });

    this.eventListeners.forEach((handler, event) => {
      element.addEventListener(event, handler);
    });

    if (this.innerHTML !== undefined) {
      element.innerHTML = this.innerHTML;
    } else if (this.innerText !== undefined) {
      element.innerText = this.innerText;
    }

    this.childNodes.forEach((child) => element.appendChild(child));

    return element;
  }
}

export const Div = (...children: (Element | ElementBuilder<any>)[]) =>
  new ElementBuilder("div").children(...children);

export const Span = (text?: string) => {
  const builder = new ElementBuilder("span");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const P = (text?: string) => {
  const builder = new ElementBuilder("p");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const H1 = (text?: string) => {
  const builder = new ElementBuilder("h1");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const H2 = (text?: string) => {
  const builder = new ElementBuilder("h2");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const Button = (text?: string) => {
  const builder = new ElementBuilder("button");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const Input = (type: string = "text") =>
  new ElementBuilder("input").attr("type", type);

export const Label = (text?: string, forId?: string) => {
  const builder = new ElementBuilder("label");
  if (text !== undefined) {
    builder.text(text);
  }
  if (forId !== undefined) {
    builder.attr("for", forId);
  }
  return builder;
};

export const Ul = (...children: (Element | ElementBuilder<any>)[]) =>
  new ElementBuilder("ul").children(...children);

export const Li = (text?: string) => {
  const builder = new ElementBuilder("li");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const A = (text?: string, href?: string) => {
  const builder = new ElementBuilder("a");
  if (text !== undefined) {
    builder.text(text);
  }
  if (href !== undefined) {
    builder.attr("href", href);
  }
  return builder;
};

export const Img = (src: string, alt?: string) => {
  const builder = new ElementBuilder("img").attr("src", src);
  if (alt !== undefined) {
    builder.attr("alt", alt);
  }
  return builder;
};

export const H3 = (text?: string) => {
  const builder = new ElementBuilder("h3");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const Table = (...children: (Element | ElementBuilder<any>)[]) =>
  new ElementBuilder("table").children(...children);

export const Thead = (...children: (Element | ElementBuilder<any>)[]) =>
  new ElementBuilder("thead").children(...children);

export const Tbody = (...children: (Element | ElementBuilder<any>)[]) =>
  new ElementBuilder("tbody").children(...children);

export const Tr = (...children: (Element | ElementBuilder<any>)[]) =>
  new ElementBuilder("tr").children(...children);

export const Td = (text?: string) => {
  const builder = new ElementBuilder("td");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const Th = (text?: string) => {
  const builder = new ElementBuilder("th");
  if (text !== undefined) {
    builder.text(text);
  }
  return builder;
};

export const Style = (css: string) =>
  new ElementBuilder("style").innerHTMLContent(css);

export const Link = (rel: string, href: string) =>
  new ElementBuilder("link").attr("rel", rel).attr("href", href);
