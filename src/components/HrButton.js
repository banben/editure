import React from "react";
import { Editor, Transforms } from "slate";
import { useSlate } from "slate-react";

import Icon from "./Icon";
import Button from "./Button";
import { HR } from "../constants";
import { getBeforeText } from "../utils";

const HrButton = () => {
  const editor = useSlate();

  const onClick = () => {
    const { beforeText } = getBeforeText(editor);

    if (beforeText) {
      Editor.insertBreak(editor);
    }

    Transforms.removeNodes(editor, {
      match: n => n.children && !n.children[0].text
    });

    const text = { text: "" };
    Transforms.insertNodes(editor, { type: HR, children: [text] });
    Transforms.insertNodes(editor, { children: [text] });
  };

  return (
    <Button title="分割线" onClick={onClick}>
      <Icon>remove</Icon>
    </Button>
  );
};

export default HrButton;