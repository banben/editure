import { Transforms, Editor, Point, Range, Element, Node } from 'tuture-slate';
import { LIST_ITEM, BULLETED_LIST, NUMBERED_LIST, PARAGRAPH } from 'editure-constants';

import { isBlockActive, decreaseItemDepth } from '../helpers';

export default function withList(editor: Editor) {
  const { deleteBackward, normalizeNode } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => n.type === LIST_ITEM
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        const parentAbove = Editor.above(editor, {
          match: n => n.type === BULLETED_LIST || n.type === NUMBERED_LIST
        });

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          parentAbove
        ) {
          const type = isBlockActive(editor, BULLETED_LIST)
            ? BULLETED_LIST
            : NUMBERED_LIST;

          const block = Editor.above(editor, {
            match: n => n.type === type
          });

          if (block) {
            const [node] = block;
            const { level = 0 } = node;

            if (level === 0) {
              Transforms.liftNodes(editor, {
                match: n => n.type === LIST_ITEM
              });

              Transforms.setNodes(editor, { type: PARAGRAPH });
            } else {
              decreaseItemDepth(editor);
            }
          }
          return;
        } else if (block.type !== PARAGRAPH && Point.equals(selection.anchor, start)) {
          Transforms.setNodes(editor, { type: PARAGRAPH });
        }
      }

      deleteBackward(...args);
    }
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (!Element.isElement(node)) {
      return normalizeNode(entry);
    }

    if (node.type === BULLETED_LIST) {
      for (const [child, childPath] of Node.children(editor, path)) {
        const { level = 0, children } = child;
        Transforms.setNodes(editor, { level, parent: node.type }, { at: childPath });

        // List item should not have any block child.
        if (children.length === 1 && Element.isElement(children[0])) {
          Transforms.unwrapNodes(editor, { at: [...childPath, 0] });
        }
      }
      return;
    }

    // If the element is a numbered-list, ensure each item has correct number.
    if (node.type === NUMBERED_LIST) {
      const counterStack: number[] = [];
      let counter = 0;
      let lastLevel = 0;

      for (const [child, childPath] of Node.children(editor, path)) {
        const { level = 0, children } = child;
        if (level > lastLevel) {
          counterStack.push(counter);
          counter = 1;
        } else if (level < lastLevel) {
          while (level < lastLevel) {
            counter = Number(counterStack.pop()) + 1;
            lastLevel--;
          }
        } else {
          counter++;
        }

        Transforms.setNodes(
          editor,
          { level, parent: node.type, number: counter },
          { at: childPath }
        );

        lastLevel = level;

        // List item should not have any block child.
        if (children.length === 1 && Element.isElement(children[0])) {
          Transforms.unwrapNodes(editor, { at: [...childPath, 0] });
        }
      }
      return;
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
}
