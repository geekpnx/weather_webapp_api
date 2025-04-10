import React, { useState, useEffect } from 'react';
import { NewsDisplayProps } from '../types/types';
import '../assets/css/NewsDisplay.css';

const NewsDisplay: React.FC<NewsDisplayProps> = ({ articles }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  
  useEffect(() => {
    if (articles.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % articles.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [articles.length]);

  if (articles.length === 0) {
    return <div>No news available.</div>;
  }

  return (
    <div className="news-container">
      <div className="news-slideshow">
        {articles.map((article, index) => (
          <div 
            key={index}
            className={`news-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              display: index === currentSlide ? 'block' : 'none'
            }}
          >
            <div className="news-item">
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-link">
                <div className="news-content-wrapper">
                  {article.urlToImage && (
                    <div className="news-image-container">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="news-image"
                      />
                    </div>
                  )}
                  <div className="news-text-container">
                    <h3 className="news-title">{article.title}</h3>
                    <p className="news-content">{truncateText(article.content, 150)}</p>
                    <p className="news-published">
                      <em>Published at: {new Date(article.publishedAt).toLocaleString()}</em>
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        ))}
      </div>
      {articles.length > 1 && (
        <div className="slide-controls">
          {articles.map((_, index) => (
            <div
              key={index}
              className={`slide-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsDisplay;