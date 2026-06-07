import React, { useState, useEffect, useMemo } from 'react';
import { Radio, Search, SlidersHorizontal, ArrowUpDown, RefreshCw, XCircle } from 'lucide-react';
import { genres as genreList } from '../data.js';
import PodcastPreviewCard from './components/PodcastPreviewCard';
import PodcastDetailModal from './components/PodcastDetailModal';
import AudioPlayer from './components/AudioPlayer';

/**
 * App Component
 * The main container of the PodWave Podcast Discovery application.
 * Manages the state of fetched podcasts, filtering, sorting, selecting, and playing.
 * 
 * @returns {JSX.Element} The rendered application.
 */
export default function App() {
  // Application Data States
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter, and Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [sortBy, setSortBy] = useState('title-asc');

  // Interactive UI States
  const [selectedShowId, setSelectedShowId] = useState(null);
  const [currentPlaying, setCurrentPlaying] = useState(null);

  // Fetch all show previews on component mount
  const fetchShows = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://podcast-api.netlify.app');
      if (!response.ok) {
        throw new Error('Unable to retrieve podcast list. Please check your connection.');
      }
      const data = await response.json();
      setShows(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An unexpected error occurred while loading podcasts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  // Filter and sort the shows list dynamically based on states
  const filteredAndSortedShows = useMemo(() => {
    let result = [...shows];

    // 1. Text Search Filter (Case insensitive matching on show title)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(show => show.title.toLowerCase().includes(query));
    }

    // 2. Genre Filter
    if (selectedGenreId !== null) {
      result = result.filter(show => 
        show.genres && show.genres.includes(Number(selectedGenreId))
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'updated-newest':
          return new Date(b.updated).getTime() - new Date(a.updated).getTime();
        case 'updated-oldest':
          return new Date(a.updated).getTime() - new Date(b.updated).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [shows, searchQuery, selectedGenreId, sortBy]);

  // Clear all filters (helper)
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenreId(null);
    setSortBy('title-asc');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: currentPlaying ? '80px' : '0px' }}>
      
      {/* HEADER NAVBAR */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(9, 13, 22, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '1rem 0'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={handleClearFilters}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <Radio color="#fff" size={24} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.5rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 40%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              PodWave
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              API Status: <span style={{ color: 'var(--cyan)' }}>Connected</span>
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="container" style={{ flexGrow: 1 }}>
        
        {/* CONTROLS PANEL (SEARCH, SORT, GENRE CHIPS) */}
        <section
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          {styleSnippet()}
          
          <div className="controls-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Search podcasts by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.75rem',
                  fontSize: '0.95rem'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ArrowUpDown
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.75rem',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none'
                }}
              >
                <option value="title-asc">Alphabetical (A - Z)</option>
                <option value="title-desc">Alphabetical (Z - A)</option>
                <option value="updated-newest">Last Updated (Newest)</option>
                <option value="updated-oldest">Last Updated (Oldest)</option>
              </select>
            </div>
          </div>

          {/* Genre Chips Row */}
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Filter by Genre
            </span>
            <div className="genres-scroll">
              <button
                onClick={() => setSelectedGenreId(null)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedGenreId === null ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                  background: selectedGenreId === null ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedGenreId === null ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'var(--transition-smooth)',
                  whiteSpace: 'nowrap'
                }}
              >
                All Genres
              </button>
              
              {genreList.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenreId(genre.id)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedGenreId === genre.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                    background: selectedGenreId === genre.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedGenreId === genre.id ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'var(--transition-smooth)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedGenreId !== genre.id) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedGenreId !== genre.id) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                >
                  {genre.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* LOADING INDICATOR */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1.5rem' }}>
            <div className="spinner"></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
              Curating your podcast feed...
            </span>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div
            className="glass-panel"
            style={{
              padding: '3rem',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              backgroundColor: 'rgba(239, 68, 68, 0.02)'
            }}
          >
            <div style={{ fontSize: '3rem' }}>📡</div>
            <h2 style={{ color: '#ef4444' }}>Network Connection Error</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: '1.6' }}>
              {error}
            </p>
            <button className="btn btn-primary" onClick={fetchShows}>
              <RefreshCw size={16} style={{ marginRight: '0.25rem' }} /> Retry Connection
            </button>
          </div>
        )}

        {/* EMPTY SEARCH / FILTER RESULTS */}
        {!loading && !error && filteredAndSortedShows.length === 0 && (
          <div
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <div style={{ fontSize: '3rem' }}>🔍</div>
            <h2>No Podcasts Found</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.5' }}>
              We couldn't find any shows matching your current filter options. Try adjusting your search query or choosing another genre.
            </p>
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        )}

        {/* PODCASTS GRID */}
        {!loading && !error && filteredAndSortedShows.length > 0 && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing {filteredAndSortedShows.length} podcast{filteredAndSortedShows.length === 1 ? '' : 's'}
              </span>
            </div>
            
            <div className="podcasts-grid">
              {filteredAndSortedShows.map((show) => (
                <PodcastPreviewCard
                  key={show.id}
                  id={show.id}
                  title={show.title}
                  description={show.description}
                  seasons={show.seasons}
                  image={show.image}
                  genres={show.genres}
                  updated={show.updated}
                  onClick={() => setSelectedShowId(show.id)}
                />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* DETAIL MODAL */}
      {selectedShowId && (
        <PodcastDetailModal
          showId={selectedShowId}
          onClose={() => setSelectedShowId(null)}
          onPlayEpisode={(episode, showTitle, showImage) => {
            setCurrentPlaying({ episode, showTitle, showImage });
          }}
          currentEpisode={currentPlaying?.episode}
        />
      )}

      {/* FLOATING AUDIO PLAYER */}
      {currentPlaying && (
        <AudioPlayer
          episode={currentPlaying.episode}
          showTitle={currentPlaying.showTitle}
          showImage={currentPlaying.showImage}
          onClose={() => setCurrentPlaying(null)}
        />
      )}
    </div>
  );
}

// Media Query Style Injector Helper
function styleSnippet() {
  return (
    <style>{`
      @media (max-width: 639px) {
        .controls-row {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  );
}
