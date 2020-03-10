import { Transforms, Editor, Point, Range, Element, Node } from 'tuture-slate';
import { CODE_BLOCK, CODE_LINE, PARAGRAPH } from 'editure-constants';

import { isBlockActive, toggleBlock } from '../helpers';
import { getLineText, getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*```\s*([a-zA-Z]*)$/];

export default function withCodeBlock(editor: Editor) {
  const { insertText, insertBreak, deleteBackward, normalizeNode } = editor;

  editor.insertText = text => {
    // Disable any shortcuts in code blocks.
    if (text === ' ' && isBlockActive(editor, CODE_BLOCK)) {
      return Transforms.insertText(editor, ' ');
    }

    insertText(text);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        if (isBlockActive(editor, CODE_BLOCK)) {
          // Already in a code block.
          return insertBreak();
        }

        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        const nodeProp = { type: CODE_BLOCK, lang: matchArr[1] };
        return toggleBlock(editor, CODE_BLOCK, nodeProp);
      }

      return insertBreak();
    }

    insertBreak();
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => n.type === CODE_BLOCK
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          isBlockActive(editor, CODE_LINE)
        ) {
          const block = Editor.above(editor, {
            match: n => n.type === CODE_BLOCK
          });

          if (block) {
            const [node] = block;

            const { wholeLineText } = getLineText(editor);
            const { children = [] } = node;

            Editor.withoutNormalizing(editor, () => {
              if (children.length === 1 && !wholeLineText) {
                toggleBlock(editor, CODE_BLOCK, {}, { unwrap: true });
              } else if (children.length > 1) {
                Transforms.mergeNodes(editor);
              }
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === CODE_BLOCK) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type !== CODE_LINE) {
          Transforms.setNodes(editor, { type: CODE_LINE }, { at: childPath });
        }
      }
      return;
    }

    normalizeNode(entry);
  };

  return editor;
}
