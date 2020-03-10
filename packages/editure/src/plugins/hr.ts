import { Editor, Transforms, Range } from 'tuture-slate';
import { HR, PARAGRAPH } from 'editure-constants';

import { getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*---$/, /^\s*\*\*\*$/, /^\s*___$/];

export default function withHr(editor: Editor) {
  const { isVoid, insertBreak } = editor;

  editor.isVoid = element => {
    return element.type === HR ? true : isVoid(element);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        const text = { text: '' };
        Transforms.removeNodes(editor, {
          match: n => n.children && !n.children[0].text
        });
        Transforms.insertNodes(editor, { type: HR, children: [text] });
        Transforms.insertNodes(editor, { type: PARAGRAPH, children: [text] });

        return;
      }

      return insertBreak();
    }

    insertBreak();
  };

  return editor;
}
