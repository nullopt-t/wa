import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const VideosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedVideos, setLikedVideos] = useState({});

  const videos = [
    {
      id: 1,
      title: "مقدمة في الصحة النفسية",
      description: "دورة مقدمة لفهم أساسيات الصحة النفسية وكيفية الحفاظ عليها",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      channel: "قناة الصحة النفسية",
      duration: "12:34",
      views: "1.2K",
      likes: 24,
      comments: 5,
      date: "2026-01-15",
      category: "مقدمة"
    },
    {
      id: 2,
      title: "تقنيات الاسترخاء العميق",
      description: "تعلم تقنيات التنفس والاسترخاء لتقليل التوتر والقلق",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      channel: "الاسترخاء اليومي",
      duration: "18:22",
      views: "2.5K",
      likes: 42,
      comments: 8,
      date: "2026-01-20",
      category: "استرخاء"
    },
    {
      id: 3,
      title: "التعامل مع الاكتئاب",
      description: "نصائح عملية للتعامل مع الاكتئاب وتحسين الحالة النفسية",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      channel: "الصحة النفسية",
      duration: "25:10",
      views: "3.1K",
      likes: 68,
      comments: 12,
      date: "2026-01-25",
      category: "اكتئاب"
    },
    {
      id: 4,
      title: "النوم الجيد وتأثيره على الصحة النفسية",
      description: "كيف يؤثر النوم الجيد على صحتك النفسية وطرق تحسينه",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      channel: "النوم والصحة",
      duration: "15:45",
      views: "1.8K",
      likes: 35,
      comments: 7,
      date: "2026-02-01",
      category: "نوم"
    },
    {
      id: 5,
      title: "القلق واضطراباته",
      description: "فهم القلق واضطراباته وكيفية التعامل معها",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      channel: "الصحة النفسية",
      duration: "22:18",
      views: "2.7K",
      likes: 51,
      comments: 9,
      date: "2026-02-05",
      category: "قلق"
    },
    {
      id: 6,
      title: "العلاقات الصحية",
      description: "كيف تبني وتحافظ على علاقات صحية ومتوازنة",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      channel: "العلاقات اليومية",
      duration: "19:30",
      views: "1.9K",
      likes: 29,
      comments: 6,
      date: "2026-02-10",
      category: "علاقات"
    }
  ];

  const categories = ['الكل', 'مقدمة', 'استرخاء', 'اكتئاب', 'نوم', 'قلق', 'علاقات'];

  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'الكل' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentVideo = filteredVideos[currentVideoIndex];

  // Handle scroll-based navigation only when mouse is over video container
  useEffect(() => {
    const handleWheel = (e) => {
      const videoContainer = document.getElementById('video-container');
      if (videoContainer && videoContainer.contains(e.target)) {
        e.preventDefault();
        
        if (e.deltaY > 0 && currentVideoIndex < filteredVideos.length - 1) {
          setCurrentVideoIndex(prev => prev + 1);
        } else if (e.deltaY < 0 && currentVideoIndex > 0) {
          setCurrentVideoIndex(prev => prev - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentVideoIndex, filteredVideos.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLike = () => {
    if (currentVideo) {
      setLikedVideos(prev => ({
        ...prev,
        [currentVideo.id]: !prev[currentVideo.id]
      }));
    }
  };


  return (
    <div className="bg-[var(--bg-primary)] min-h-screen relative">
      {/* Floating Filter Menu */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-14 h-14 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--primary-hover)] transition-colors"
        >
          <i className={`fas ${showFilters ? 'fa-times' : 'fa-filter'} text-xl`}></i>
        </button>

        {showFilters && (
          <div className="absolute top-16 right-0 bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-6 w-80 border border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 text-right">الفلاتر</h3>

            <div className="mb-6">
              <label className="block text-[var(--text-primary)] mb-2 text-right">البحث</label>
              <input
                type="text"
                placeholder="ابحث في الفيديوهات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-primary)] mb-2 text-right">الفئة</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowFilters(false); // Close the menu after selection
                    }}
                    className={`px-4 py-2 rounded-xl transition-colors text-center ${
                      selectedCategory === category
                        ? 'bg-[var(--accent-amber)] text-white'
                        : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>


      <section className="py-8">
        <div className="max-w-lg mx-auto px-4">
          {filteredVideos.length > 0 ? (
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-[9/16] mx-auto video-container" id="video-container">
              {/* Video Player */}
              <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
                <img 
                  src={currentVideo?.thumbnail} 
                  alt={currentVideo?.title} 
                  className="w-full h-full object-cover"
                />
                
                {/* Play/Pause Overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-[var(--primary-color)] hover:bg-opacity-100 transition-all"
                    >
                      <i className="fas fa-play text-xl"></i>
                    </button>
                  </div>
                )}

                {/* Duration Overlay */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded">
                  {currentVideo?.duration}
                </div>
              </div>

              {/* Action Buttons - Like only */}
              <div className="absolute right-4 bottom-24 flex flex-col gap-6">
                <button
                  onClick={toggleLike}
                  className={`w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all ${
                    likedVideos[currentVideo?.id] ? 'text-[var(--accent-red)]' : ''
                  }`}
                >
                  <i className={`fas ${likedVideos[currentVideo?.id] ? 'fa-heart' : 'fa-heart'} text-xl`}></i>
                </button>
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{currentVideo?.title}</h3>
                <p className="text-sm text-gray-200 mb-3 line-clamp-2">{currentVideo?.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-heart"></i> {currentVideo?.likes}
                  </span>
                  <span className="text-gray-300">
                    {currentVideo?.channel} • {currentVideo?.date}
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="absolute top-4 left-4 flex gap-1">
                {filteredVideos.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentVideoIndex ? 'bg-white' : 'bg-gray-400'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-search text-6xl text-[var(--text-secondary)] mb-4"></i>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">لا توجد فيديوهات مطابقة</h3>
              <p className="text-[var(--text-secondary)]">حاول تغيير الفلاتر أو معاودة البحث</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VideosPage;