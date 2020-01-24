import React, { useMemo, useState, useCallback } from "react";

// Import the Slate editor factory.
import { createEditor, Transforms } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import isHotkey from "is-hotkey";
import { withHistory } from "slate-history";
import { css } from "emotion";

import CustomEditor, {
  withBulletedLists,
  withNumberedLists,
  withHeadings,
  withLinks,
  withImages,
  withHr,
  withShortcuts
} from "./helpers";
import {
  DefaultElement,
  CodeBlockElement,
  LinkElement,
  ImageElement,
  BlockquoteElement,
  BulletedListElement,
  ListItemElement,
  NumberedListElement,
  HeadingOneElement,
  HeadingTwoElement,
  HeadingThreeElement,
  HeadingFourElement,
  HrElement
} from "./elements";
import Leaf, { toggleMark } from "./marks";
import { Toolbar, MarkButton, BlockButton } from "./components";

import "./App.css";
import "material-icons/iconfont/material-icons.css";

const defaultValue = [
  {
    children: [
      {
        text: "Hail Tuture!"
      }
    ]
  }
];

const MARK_HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "ctrl+`": "code",
  "mod+shift+`": "strikethrough"
};

const BLOCK_HOTKEYS = {
  "mod+0": "paragraph",
  "mod+1": "heading-one",
  "mod+2": "heading-two",
  "mod+3": "heading-three",
  "mod+4": "heading-four",
  "mod+shift+c": "code-block",
  "mod+shift+i": "image",
  "mod+shift+u": "block-quote",
  "mod+alt+u": "bulleted-list",
  "mod+alt+o": "numbered-list",
  "mod+alt+-": "hr"
};

const plugins = [
  withReact,
  withHistory,
  withBulletedLists,
  withNumberedLists,
  withHeadings,
  withHr,
  withImages,
  withLinks,
  withShortcuts
];

const App = () => {
  const editor = useMemo(
    () => plugins.reduce((editor, plugin) => plugin(editor), createEditor()),
    []
  );
  const [value, setValue] = useState(defaultValue);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case "paragraph":
        return <DefaultElement {...props} />;

      case "code-block":
        return <CodeBlockElement {...props} />;

      case "link":
        return <LinkElement {...props} />;

      case "image":
        return <ImageElement {...props} />;

      case "block-quote":
        return <BlockquoteElement {...props} />;

      case "bulleted-list":
        return <BulletedListElement {...props} />;

      case "list-item":
        return <ListItemElement {...props} />;

      case "numbered-list":
        return <NumberedListElement {...props} />;

      case "heading-one":
        return <HeadingOneElement {...props} />;

      case "heading-two":
        return <HeadingTwoElement {...props} />;

      case "heading-three":
        return <HeadingThreeElement {...props} />;

      case "heading-four":
        return <HeadingFourElement {...props} />;

      case "hr":
        return <HrElement {...props} />;

      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  return (
    <div
      className={css`
        max-width: 42em;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
      `}
    >
      <Slate
        editor={editor}
        value={value}
        onChange={value => {
          setValue(value);
        }}
      >
        <Toolbar>
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <MarkButton format="strikethrough" icon="format_strikethrough" />
          <MarkButton format="code" icon="code" />
          <BlockButton
            format="link"
            icon="link"
            isBlockActive={CustomEditor.isLinkActive}
            toggleBlock={CustomEditor.toggleLinkElement}
          />
          <BlockButton
            format="heading-one"
            icon="looks_one"
            isBlockActive={CustomEditor.isHeadingActive}
            toggleBlock={CustomEditor.toggleHeading}
          />
          <BlockButton
            format="heading-two"
            icon="looks_two"
            isBlockActive={CustomEditor.isHeadingActive}
            toggleBlock={CustomEditor.toggleHeading}
          />
          <BlockButton
            format="block-quote"
            icon="format_quote"
            isBlockActive={CustomEditor.isBlockquoteActive}
            toggleBlock={CustomEditor.toggleBlockquoteElement}
          />
          <BlockButton
            format="code-block"
            icon="attach_money"
            isBlockActive={CustomEditor.isCodeBlockActive}
            toggleBlock={CustomEditor.toggleCodeBlockElement}
          />
          <BlockButton
            format="numbered-list"
            icon="format_list_numbered"
            isBlockActive={CustomEditor.isNumberedListActive}
            toggleBlock={CustomEditor.toggleNumberedListElement}
          />
          <BlockButton
            format="bulleted-list"
            icon="format_list_bulleted"
            isBlockActive={CustomEditor.isBulletedListActive}
            toggleBlock={CustomEditor.toggleBulletedListElement}
          />
          <BlockButton
            format="image"
            icon="image"
            isBlockActive={CustomEditor.isImageActive}
            toggleBlock={CustomEditor.toggleImageElement}
          />
          <BlockButton
            format="hr"
            icon="remove"
            isBlockActive={CustomEditor.isHrActive}
            toggleBlock={CustomEditor.insertHr}
          />
        </Toolbar>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck
          autoFocus
          onKeyDown={event => {
            for (const hotkey in MARK_HOTKEYS) {
              console.log("mark", event.key);
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = MARK_HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }

            if (isHotkey("mod+0", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "paragraph");
            }

            if (isHotkey("mod+1", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "heading-one");
            }

            if (isHotkey("mod+2", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "heading-two");
            }

            if (isHotkey("mod+3", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "heading-three");
            }

            if (isHotkey("mod+4", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "heading-four");
            }

            // 处理代码逻辑
            if (isHotkey("mod+shift+c", event)) {
              event.preventDefault();

              CustomEditor.toggleCodeBlockElement(editor);
            }

            if (
              event.key === "Enter" &&
              (CustomEditor.isCodeBlockActive(editor) ||
                CustomEditor.isBlockquoteActive(editor))
            ) {
              event.preventDefault();

              Transforms.insertText(editor, "\n");
            }

            if (isHotkey("mod+k", event)) {
              event.preventDefault();

              CustomEditor.toggleLinkElement(editor);
            }

            if (isHotkey("mod+shift+i", event)) {
              event.preventDefault();

              CustomEditor.toggleImageElement(editor);
            }

            if (isHotkey("mod+shift+u", event)) {
              event.preventDefault();

              CustomEditor.toggleBlockquoteElement(editor);
            }

            if (isHotkey("mod+alt+u", event)) {
              event.preventDefault();

              CustomEditor.toggleBulletedListElement(editor);
            }

            if (isHotkey("mod+alt+o", event)) {
              event.preventDefault();

              CustomEditor.toggleNumberedListElement(editor);
            }

            if (isHotkey("mod+alt+-", event)) {
              event.preventDefault();

              CustomEditor.insertHr(editor);
            }
          }}
        />
      </Slate>
    </div>
  );
};

export default App;
