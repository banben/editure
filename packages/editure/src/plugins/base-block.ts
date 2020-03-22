import { Editor, Transforms } from 'tuture-slate';
import * as F from 'editure-constants';

export interface EditorWithBlock extends Editor {
  isBlockActive(format: string): boolean;
  toggleBlock(format: string, props?: any): void;
  updateBlock(format: string, props?: any): void;
  detectBlockFormat(formats: string[]): string | null;
}

export const withBaseBlock = <T extends Editor>(editor: T) => {
  const e = editor as T & EditorWithBlock;

  e.isBlockActive = (format: string) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === format,
    });
    return !!match;
  };

  e.toggleBlock = (format: string, props?: any) => {
    if (!e.isBlockActive(format)) {
      return Transforms.setNodes(editor, {
        ...props,
        type: format,
      });
    }

    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === format,
    });
    const [node] = match;

    Transforms.setNodes(editor, {
      type: F.PARAGRAPH,
    });

    // Remove other fields.
    const attrs = Object.keys(node).filter((k) => !['type', 'children'].includes(k));
    Transforms.unsetNodes(editor, attrs);
  };

  e.updateBlock = (format: string, props?: any) => {
    Transforms.setNodes(editor, props, {
      match: (n) => n.type === format,
    });
  };

  e.detectBlockFormat = (formats: string[]) => {
    let pathLength = -1;
    let realFormat = null;

    for (const format of formats) {
      if (e.isBlockActive(format)) {
        const block = Editor.above(editor, {
          match: (n) => n.type === format,
        });

        if (block) {
          const [, path] = block;

          if (path.length > pathLength) {
            pathLength = path.length;
            realFormat = format;
          }
        }
      }
    }

    return realFormat;
  };

  return e;
};
