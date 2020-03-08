import { Editor, Transforms } from 'tuture-slate';
import { getBeforeText } from '../utils';

export const insertVoid = (editor: Editor, format: string, props: any) => {
  const { beforeText } = getBeforeText(editor);

  if (beforeText) {
    Editor.insertBreak(editor);
  }

  Transforms.removeNodes(editor, {
    match: n => n.children && !n.children[0].text
  });

  const text = { text: '' };
  Transforms.insertNodes(editor, { type: format, ...props, children: [text] });
  Transforms.insertNodes(editor, { children: [text] });
};
