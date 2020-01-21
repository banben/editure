import React, { useEffect, useMemo, useState, useCallback } from "react";

// Import the Slate editor factory.
import { createEditor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import isHotkey from "is-hotkey";
import { withHistory } from "slate-history";
import { css } from "emotion";

import CustomEditor, { withLinks, withImages, withHr } from "./helpers";
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
import {
  DefaultMark,
  CodeMark,
  BoldMark,
  ItalicMark,
  UnderlineMark,
  StrikethroughMark
} from "./marks";

import "./App.css";

const defaultValue = [
  {
    children: [
      {
        text: "A line of text in a paragraph."
      }
    ]
  }
];

const App = () => {
  const editor = useMemo(
    () => withHr(withImages(withLinks(withHistory(withReact(createEditor()))))),
    []
  );
  const [value, setValue] = useState(defaultValue);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case "paragraph":
        return <DefaultElement {...props} />;

      case "codeBlock":
        return <CodeBlockElement {...props} />;

      case "link":
        return <LinkElement {...props} />;

      case "image":
        return <ImageElement {...props} />;

      case "blockquote":
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

  const renderLeaf = useCallback(props => {
    switch (props.leaf.type) {
      case "code":
        return <CodeMark {...props} />;

      case "bold":
        return <BoldMark {...props} />;

      case "italic":
        return <ItalicMark {...props} />;

      case "underline":
        return <UnderlineMark {...props} />;

      case "strikethrough":
        return <StrikethroughMark {...props} />;

      default:
        return <DefaultMark {...props} />;
    }
  }, []);

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
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck
          autoFocus
          onKeyDown={event => {
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

            if (isHotkey("mod+shift+c", event)) {
              event.preventDefault();

              CustomEditor.toggleCodeBlockElement(editor);
            }

            if (isHotkey("mod+k", event)) {
              event.preventDefault();

              if (CustomEditor.isLinkActive(editor)) {
                CustomEditor.unwrapLink(editor);
              } else {
                const url = window.prompt("输入链接");

                if (!url) {
                  return;
                }

                CustomEditor.wrapLink(editor, url);
              }
            }

            if (isHotkey("mod+shift+i", event)) {
              event.preventDefault();

              if (CustomEditor.isImageActive(editor)) {
                CustomEditor.removeImage(editor);
              } else {
                const url = window.prompt("输入图片链接");

                if (!url) {
                  return;
                }

                CustomEditor.insertImage(editor, url);
              }
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

            if (isHotkey("mod+b", event)) {
              event.preventDefault();

              CustomEditor.toggleBoldMark(editor);
            }

            if (isHotkey("ctrl+`", event)) {
              event.preventDefault();

              CustomEditor.toggleCodeMark(editor);
            }

            if (isHotkey("mod+i", event)) {
              event.preventDefault();

              CustomEditor.toggleItalicMark(editor);
            }

            if (isHotkey("mod+u", event)) {
              event.preventDefault();

              CustomEditor.toggleUnderlineMark(editor);
            }

            if (isHotkey("ctrl+shift+`", event)) {
              event.preventDefault();

              CustomEditor.toggleStrikethroughMark(editor);
            }
          }}
        />
      </Slate>
    </div>
  );
};

export default App;
