import React from 'react';
import { NewsDisplayProps } from '../types/types';
import '../../../backend/static/css/NewsDisplay.css'; // Adjust the path as needed

const NewsDisplay: React.FC<NewsDisplayProps> = ({ articles }) => {
  if (articles.length === 0) {
    return <div>No news available.</div>;
  }

  return (
    <div className="news-display">
      <h2>Latest Weather News</h2>
      <ul>
        {articles.map((article, index) => (
          <li key={index}>
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt={article.title}
              />
            )}
            <div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.title}
              </a>
              <p>
                <em>{new Date(article.publishedAt).toLocaleDateString()}</em>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsDisplay;
