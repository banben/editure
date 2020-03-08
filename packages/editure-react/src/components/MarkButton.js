import React from 'react';
import { useSlate } from 'tuture-slate-react';
import { isMarkActive, toggleMark } from 'editure';

import Icon from './Icon';
import Button from './Button';

const MarkButton = ({ format = '', icon, title }) => {
  const editor = useSlate();

  return (
    <Button
      title={title}
      active={isMarkActive(editor, format)}
      handleMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}>
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default MarkButton;
