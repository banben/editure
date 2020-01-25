import React, { useMemo, useState, useCallback } from "react";

// Import the Slate editor factory.
import { createEditor, Transforms, Editor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import isHotkey from "is-hotkey";
import { withHistory } from "slate-history";
import { css } from "emotion";

import CustomEditor, { customPlugins } from "./helpers";
import Element, { isBlockActive, toggleBlock } from "./blocks";
import Leaf, { toggleMark } from "./marks";
import highlight from "./utils/highlight";
import {
  BOLD,
  ITALIC,
  UNDERLINE,
  CODE,
  STRIKETHROUGH,
  PARAGRAPH,
  H1,
  H2,
  H3,
  H4,
  CODE_BLOCK,
  LINK,
  IMAGE,
  BLOCK_QUOTE,
  BULLETED_LIST,
  NUMBERED_LIST,
  HR
} from "./constants";
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
  "mod+b": BOLD,
  "mod+i": ITALIC,
  "mod+u": UNDERLINE,
  "mod+`": CODE,
  "mod+shift+`": STRIKETHROUGH
};

const BLOCK_HOTKEYS = {
  "mod+0": PARAGRAPH,
  "mod+1": H1,
  "mod+2": H2,
  "mod+3": H3,
  "mod+4": H4,
  "mod+shift+c": CODE_BLOCK,
  "mod+k": LINK,
  "mod+shift+i": IMAGE,
  "mod+shift+u": BLOCK_QUOTE,
  "mod+alt+u": BULLETED_LIST,
  "mod+alt+o": NUMBERED_LIST,
  "mod+alt+-": HR
};

const plugins = [withReact, withHistory, ...customPlugins];

const App = () => {
  const editor = useMemo(
    () => plugins.reduce((editor, plugin) => plugin(editor), createEditor()),
    []
  );
  const [value, setValue] = useState(defaultValue);

  const renderElement = useCallback(Element, []);
  const renderLeaf = useCallback(Leaf, []);
  const decorate = useCallback(
    args => (isBlockActive(editor, CODE_BLOCK) ? highlight(args) : []),
    [editor]
  );

  return (
    <div
      className={css`
        max-width: 42em;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
      `}>
      <Slate
        editor={editor}
        value={value}
        onChange={value => {
          setValue(value);
        }}>
        <Toolbar>
          <MarkButton format={BOLD} icon="format_bold" title="加粗" />
          <MarkButton format={ITALIC} icon="format_italic" title="斜体" />
          <MarkButton format={UNDERLINE} icon="format_underlined" title="下划线" />
          <MarkButton format={STRIKETHROUGH} icon="format_strikethrough" title="删除线" />
          <MarkButton format={CODE} icon="code" title="内联代码" />
          <BlockButton format={LINK} icon="link" title="添加链接" />
          <BlockButton format={H1} icon="looks_one" title="一级标题" />
          <BlockButton format={H2} icon="looks_two" title="二级标题" />
          <BlockButton format={BLOCK_QUOTE} icon="format_quote" title="引用" />
          <BlockButton format={CODE_BLOCK} icon="attach_money" title="代码块" />
          <BlockButton
            format={NUMBERED_LIST}
            icon="format_list_numbered"
            title="有序列表"
          />
          <BlockButton
            format={BULLETED_LIST}
            icon="format_list_bulleted"
            title="无序列表"
          />
          <BlockButton format={IMAGE} icon="image" title="图片" />
          <BlockButton format={HR} icon="remove" title="分割线" />
        </Toolbar>
        <Editable
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck
          autoFocus
          onKeyDown={event => {
            for (const hotkey in MARK_HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = MARK_HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }

            for (const hotkey in BLOCK_HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = BLOCK_HOTKEYS[hotkey];
                toggleBlock(editor, mark);
              }
            }

            // 全选，在代码块/引用里面按 mod+a 或者 shift + command + up
            // 应该选择代码块/引用内的内容
            if (isHotkey("mod+a", event) || isHotkey("mod+shift+up", event)) {
              if (
                CustomEditor.isBlockquoteActive(editor) ||
                CustomEditor.isCodeBlockActive(editor)
              ) {
                event.preventDefault();
                let type = BLOCK_QUOTE;

                if (CustomEditor.isCodeBlockActive(editor)) {
                  type = CODE_BLOCK;
                }

                const match = Editor.above(editor, {
                  match: n => Element.matches(n, { type })
                });

                const path = match[1];

                const anchor = Editor.start(editor, path);
                const focus = Editor.end(editor, path);
                const range = { anchor, focus };
                Transforms.select(editor, range);
              }
            }

            // 删除，在代码块/引用里面按 mod+delete 或者 shift + command + up
            // 应该删除代码块/引用中当前行之前的内容
            if (isHotkey("mod+backspace", event)) {
              event.preventDefault();

              // 具体就是遍历此代码块/引用的  children 数组
              // 找到最近的一个 \n 字符，然后删除此 \n 之后的字符到光标此时选中的字符
              const { selection, children } = editor;
              const { anchor } = selection;
              const { path, offset } = anchor;

              for (let i = 0; i <= anchor.path[1]; i++) {
                const nowSelectionText = children[path[0]].children[i].text || "";

                const sliceOffset =
                  i === anchor.path[1] ? offset : nowSelectionText.length;

                if (nowSelectionText.slice(0, sliceOffset).includes("\n")) {
                  const enterLocation = nowSelectionText.lastIndexOf("\n");

                  const focus = {
                    path: [path[0], i],
                    offset: enterLocation + 1
                  };
                  const range = { anchor: focus, focus: anchor };
                  Transforms.select(editor, range);
                  Transforms.delete(editor);
                } else if (i === 0) {
                  const range = {
                    anchor: { path: [path[0], 0], offset: 0 },
                    focus: anchor
                  };
                  Transforms.select(editor, range);
                  Transforms.delete(editor);
                }
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};

export default App;
