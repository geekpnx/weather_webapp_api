import React from 'react';
import { NewsDisplayProps } from '../types/types'; // Import the ForecastItem interface


const NewsDisplay: React.FC<NewsDisplayProps> = ({ articles }) => {
  if (articles.length === 0) {
    return <div>No news available.</div>;
  }

  return (
    <div>
      <h2>Latest Weather News</h2>
      <ul>
        {articles.map((article, index) => (
          <li key={index}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {/* Render the image if urlToImage exists */}
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                />
              )}
              <h3>{article.title}</h3>
              <p>{article.content}</p>
              <p><em>Published at: {new Date(article.publishedAt).toLocaleString()}</em></p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsDisplay;