import React from 'react';

export default ({articles}) => (
  <ul>
    {articles.map(article =>
      <li key={article.id}>{article.title}</li>
    )}
  </ul>
);
