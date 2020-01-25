import React, { useState } from "react";
import { css } from "emotion";
import { useSlate } from "slate-react";
import { Editor, Transforms, Element } from "slate";
import { useSelected, useFocused } from "slate-react";

import { languages, enumPrismLangToLanguage } from "./utils/code";
import {
  H1,
  H2,
  H3,
  H4,
  CODE_BLOCK,
  NUMBERED_LIST,
  BULLETED_LIST,
  PARAGRAPH,
  LIST_ITEM,
  BLOCK_QUOTE,
  LINK,
  IMAGE,
  HR
} from "./constants";

const LIST_TYPES = [NUMBERED_LIST, BULLETED_LIST];

const CodeBlockElement = props => {
  const { element } = props;
  const { lang: defaultLang = "Plain Text" } = element;

  const [lang, setLang] = useState(defaultLang);
  const editor = useSlate();

  function handleChange(event) {
    setLang(event.target.value);

    Transforms.setNodes(
      editor,
      { lang: event.target.value },
      {
        match: n => Element.matches(n, { type: CODE_BLOCK })
      }
    );
  }

  const selectValue =
    enumPrismLangToLanguage[enumPrismLangToLanguage[lang.toLocaleLowerCase()]];

  return (
    <div {...props.attributes}>
      <select contentEditable={false} value={selectValue} onChange={handleChange}>
        {languages.map(language => (
          <option key={language} value={enumPrismLangToLanguage[language]}>
            {language}
          </option>
        ))}
      </select>
      <pre>
        <code lang={`language-${lang}`}>{props.children}</code>
      </pre>
    </div>
  );
};

const HrElement = ({ attributes, children }) => {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <div
      {...attributes}
      className={css`
        border-bottom: 2px solid #ddd;
        box-shadow: ${selected && focused ? "0 0 0 3px #B4D5FF" : "none"};
      `}>
      {children}
    </div>
  );
};

const ImageElement = props => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const focused = useFocused();

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.url}
          alt={element.url}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? "0 0 0 3px #B4D5FF" : "none"};
          `}
        />
      </div>
      {children}
    </div>
  );
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? PARAGRAPH : isList ? LIST_ITEM : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export default props => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case BLOCK_QUOTE:
      return <blockquote {...attributes}>{children}</blockquote>;
    case BULLETED_LIST:
      return <ul {...attributes}>{children}</ul>;
    case H1:
      return <h1 {...attributes}>{children}</h1>;
    case H2:
      return <h2 {...attributes}>{children}</h2>;
    case H3:
      return <h3 {...attributes}>{children}</h3>;
    case H4:
      return <h4 {...attributes}>{children}</h4>;
    case LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    case NUMBERED_LIST:
      return <ol {...attributes}>{children}</ol>;
    case CODE_BLOCK:
      return <CodeBlockElement {...props} />;
    case IMAGE:
      return <ImageElement {...props} />;
    case HR:
      return <HrElement {...props} />;
    case LINK:
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};
