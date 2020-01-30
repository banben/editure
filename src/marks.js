import React, { Fragment } from "react";
import { Editor } from "slate";

import { isBlockActive } from "./blocks";
import { CODE_BLOCK } from "./constants";

const Link = ({ attributes, children, url }) => {
  return (
    <Fragment>
      <a {...attributes} href={url || "#"}>
        {children}
      </a>
    </Fragment>
  );
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isBlockActive(editor, CODE_BLOCK)) {
    return;
  }

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export default ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.strikethrough) {
    children = <span style={{ textDecoration: "line-through" }}>{children}</span>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.link) {
    children = (
      <Link {...attributes} url={leaf.url}>
        {children}
      </Link>
    );
  }

  return (
    <span {...attributes} className={leaf.prismToken ? leaf.className : ""}>
      {children}
    </span>
  );
};
