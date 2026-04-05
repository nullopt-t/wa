import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import ArticleCard from '../components/articles/ArticleCard.jsx';
import ContextualChatPrompt from '../components/ContextualChatPrompt.jsx';
import { articlesAPI } from '../services/communityApi.js';
import { getApiUrl } from '../config.js';

const ArticleDetailPage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { error: showError } = useToast();

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await articlesAPI.getBySlug(articleId);
      setArticle(data);

      // Load related articles
      if (data.tags && data.tags.length > 0) {
        const related = await articlesAPI.getAll({
          tag: data.tags[0],
          limit: 3,
          status: 'published',
        });
        setRelatedArticles(related.articles.filter(a => a._id !== data._id).slice(0, 3));
      }
    } catch (error) {
      
      showError('المقالة غير موجودة');
      setTimeout(() => navigate('/articles'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCoverImageUrl = (coverImagePath) => {
    if (!coverImagePath) return null;
    return getApiUrl(coverImagePath);
  };

  const coverImage = article ? getCoverImageUrl(article.coverImage) : null;

  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <button
            onClick={() => navigate('/articles')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors mb-8"
          >
            <i className="fas fa-arrow-right"></i>
            <span>العودة للمقالات</span>
          </button>
        </AnimatedItem>

        {/* Article Card */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
            {/* Cover Image */}
            {coverImage && (
              <div className="relative h-64 md:h-96 overflow-hidden">
                <img
                  src={coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-10">
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6 break-words">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-8 border-b border-[var(--border-color)]/30">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-sm text-[var(--text-secondary)]">
                    <p className="font-medium text-[var(--text-primary)]">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
                      {article.readTime || 5} دقائق قراءة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] flex-shrink-0">
                  {/* Like button removed */}
                </div>
              </div>

              {/* Article Content */}
              <style>{`
                .article-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 0.5rem;
                  margin: 1rem 0;
                  display: block;
                }
                .article-content p {
                  margin-bottom: 1rem;
                  line-height: 1.8;
                }
                .article-content h1,
                .article-content h2,
                .article-content h3,
                .article-content h4,
                .article-content h5,
                .article-content h6 {
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  font-weight: bold;
                }
                .article-content ul,
                .article-content ol {
                  margin: 1rem 0;
                  padding-right: 2rem;
                }
                .article-content li {
                  margin-bottom: 0.5rem;
                }
                .article-content blockquote {
                  border-right: 4px solid var(--primary-color);
                  padding-right: 1rem;
                  margin: 1rem 0;
                  font-style: italic;
                  background: var(--bg-secondary);
                  padding: 1rem;
                  border-radius: 0.5rem;
                }
                .article-content pre {
                  background: var(--bg-secondary);
                  padding: 1rem;
                  border-radius: 0.5rem;
                  overflow-x: auto;
                  margin: 1rem 0;
                }
                .article-content code {
                  background: var(--bg-secondary);
                  padding: 0.2rem 0.4rem;
                  border-radius: 0.25rem;
                  font-family: monospace;
                  font-size: 0.9em;
                }
              `}</style>
              <div className="article-content text-[var(--text-primary)] leading-relaxed space-y-4 text-base md:text-lg break-words"
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{ 
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}
              />
            </div>
          </div>
        </AnimatedItem>

        {/* Chat Prompt */}
        <AnimatedItem type="slideUp" delay={0.4}>
          <div className="mt-12 bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 text-center">
            <p className="text-[var(--text-secondary)] mb-4">عندك أسئلة عن المقال؟ اسأل المساعد الذكي</p>
            <div className="flex justify-center">
              <ContextualChatPrompt message={`قريت المقال ده: "${article?.title}" - ممكن تشرحلي أكتر؟`} icon="fa-question-circle" text="اسأل المساعد" />
            </div>
          </div>
        </AnimatedItem>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <AnimatedItem type="slideUp" delay={0.5}>
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <i className="fas fa-newspaper text-[var(--primary-color)]"></i>
                مقالات ذات صلة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard key={relatedArticle._id} article={relatedArticle} />
                ))}
              </div>
            </div>
          </AnimatedItem>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
