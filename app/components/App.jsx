import React from 'react';
import uuid from 'uuid';
import Articles from './articles';

const articles = [
  {
    id: uuid.v4(),
    title: 'Dump 1'
  }, {
    id: uuid.v4(),
    title: 'Dump 2'
  }
];

export default () => <Articles articles={articles}/>;
