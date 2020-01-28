import { Editor, Transforms } from "slate";

import { getBeforeText } from "./index";
import { NOTE } from "../constants";

export const levels = ["default", "primary", "success", "info", "warning", "danger"];

export const palette = {
  default: { border: "#777", background: "#f7f7f7" },
  primary: { border: "#6f42c1", background: "#f5f0fa" },
  success: { border: "#5cb85c", background: "#eff8f0" },
  info: { border: "#428bca", background: "#eef7fa" },
  warning: { border: "#f0ad4e", background: "#fdf8ea" },
  danger: { border: "#d9534f", background: "#fcf1f2" }
};

export const icons = {
  primary: { content: "\f055", color: "#6f42c1" },
  success: { content: "\f058", color: "#5cb85c" },
  info: { content: "\f05a", color: "#428bca" },
  warning: { content: "\f056", color: "#f0ad4e" },
  danger: { content: "\f056", color: "#d9534f" }
};

export const insertNote = (editor, level) => {
  const { beforeText } = getBeforeText(editor);

  if (beforeText) {
    Editor.insertBreak(editor);
  }

  const text = { text: "" };
  const note = { type: NOTE, level, children: [text] };
  Transforms.removeNodes(editor, {
    match: n => n.children && !n.children[0].text
  });
  Transforms.insertNodes(editor, note);
};
