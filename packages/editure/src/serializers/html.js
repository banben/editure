import escapeHtml from "escape-html";
import { Text } from "slate";
import { jsx } from "slate-hyperscript";
import * as F from "editure-constants";

const MARK_DECORATORS = {
  [F.CODE]: node => ({ ...node, text: `<code>${node.text}</code>` }),
  [F.BOLD]: node => ({ ...node, text: `<strong>${node.text}</strong>` }),
  [F.ITALIC]: node => ({ ...node, text: `<em>${node.text}</em>` }),
  [F.STRIKETHROUGH]: node => ({
    ...node,
    text: `<span style="text-decoration: line-through">${node.text}</span>`
  }),
  [F.UNDERLINE]: node => ({ ...node, text: `<u>${node.text}</u>` }),
  [F.LINK]: node => ({
    ...node,
    text: `<a href="${escapeHtml(node.url)}">${node.text}</a>`
  })
};

const joinChildren = node => node.children.map(n => serialize(n)).join("");

const BLOCK_CONVERTERS = {
  [F.H1]: node => `<h1>${joinChildren(node)}</h1>`,
  [F.H2]: node => `<h2>${joinChildren(node)}</h2>`,
  [F.H3]: node => `<h3>${joinChildren(node)}</h3>`,
  [F.H4]: node => `<h4>${joinChildren(node)}</h4>`,
  [F.H5]: node => `<h5>${joinChildren(node)}</h5>`,
  [F.PARAGRAPH]: node => `<p>${joinChildren(node)}</p>`,
  [F.IMAGE]: node => `<img src="${escapeHtml(node.url)}" alt="" />`,
  [F.HR]: () => "<hr />",
  [F.BLOCK_QUOTE]: node => `<blockquote>${joinChildren(node)}</blockquote>`,
  [F.NOTE]: node => `<blockquote>${joinChildren(node)}</blockquote>`,
  [F.BULLETED_LIST]: node => {
    const { children } = node;
    const items = children.map(item => `<li>${item.children[0].text}</li>`);
    return `<ul>${items.join("")}</ul>`;
  },
  [F.NUMBERED_LIST]: node => {
    const { children } = node;
    const items = children.map(item => `<li>${item.children[0].text}</li>`);
    return `<ol>${items.join("")}</ol>`;
  },
  [F.CODE_BLOCK]: node => {
    const { children } = node;
    const codeLines = children.map(line => `<code>${line.children[0].text}</code>`);
    return `<pre>${codeLines.join("")}</pre>`;
  }
};

const ELEMENT_TAGS = {
  BLOCKQUOTE: () => ({ type: F.BLOCK_QUOTE }),
  H1: () => ({ type: F.H1 }),
  H2: () => ({ type: F.H2 }),
  H3: () => ({ type: F.H3 }),
  H4: () => ({ type: F.H4 }),
  H5: () => ({ type: F.H5 }),
  H6: () => ({ type: F.PARAGRAPH }),
  HR: () => ({ type: F.HR }),
  IMG: el => ({ type: F.IMAGE, url: el.getAttribute("src") }),
  LI: el => ({
    type: LIST_ITEM,
    parent: el.parentNode.nodeName === "UL" ? F.BULLETED_LIST : F.NUMBERED_LIST
  }),
  OL: () => ({ type: F.NUMBERED_LIST }),
  P: () => ({ type: F.PARAGRAPH }),
  DIV: () => ({ type: F.PARAGRAPH }),
  PRE: () => ({ type: F.CODE_BLOCK }),
  UL: () => ({ type: F.BULLETED_LIST })
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  A: el => ({ link: true, url: el.getAttribute("href") }),
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true })
};

const serialize = node => {
  if (Text.isText(node)) {
    const markedNode = Object.keys(MARK_DECORATORS).reduce(
      (decoratedNode, currentMark) => {
        return node[currentMark]
          ? MARK_DECORATORS[currentMark](decoratedNode)
          : decoratedNode;
      },
      { ...node, text: escapeHtml(node.text) }
    );

    return markedNode.text;
  }

  const converter = BLOCK_CONVERTERS[node.type];
  if (typeof converter === "function") {
    return converter(node);
  }

  return joinChildren(node, "");
};

const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return jsx("element", { type: F.PARAGRAPH }, [{ text: "" }]);
  }

  const { nodeName } = el;

  if (nodeName === "PRE") {
    const attrs = ELEMENT_TAGS["PRE"]();

    try {
      return jsx(
        "element",
        attrs,
        Array.from(el.childNodes).map(child =>
          jsx("element", { type: F.CODE_LINE }, [{ text: child.textContent }])
        )
      );
    } catch {
      return jsx("element", attrs, [
        jsx("element", F.CODE_LINE, [{ text: el.textContent }])
      ]);
    }
  }

  const children = Array.from(el.childNodes)
    .map(deserialize)
    .flat();

  // Ensure that children is not empty.
  if (children.length === 0) {
    children.push({ text: "" });
  }

  if (nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (["P", "DIV"].includes(nodeName)) {
    // If any child is a block, return all children directly without adding any type.
    for (const child of children) {
      if (child.type) {
        return children;
      }
    }
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx("element", attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map(child => jsx("text", attrs, child));
  }

  return children;
};

export const toHtml = serialize;

export const parseHtml = text => {
  const parsed = new DOMParser().parseFromString(text, "text/html");
  return deserialize(parsed.body);
};
