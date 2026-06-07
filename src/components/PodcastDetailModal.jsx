import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Layers, Activity } from 'lucide-react';
import { genres as genreList } from '../../data.js';

/**
 * @typedef {Object} Episode
 * @property {string} title - The title of the episode.
 * @property {string} description - The description of the episode.
 * @property {number} episode - The episode number in the season.
 * @property {string} file - The audio URL string.
 */

/**
 * @typedef {Object} Season
 * @property {number} season - The season number.
 * @property {string} title - The title of the season.
 * @property {string} image - The cover image for the season.
 * @property {Episode[]} episodes - The episodes in the season.
 */

/**
 * @typedef {Object} ShowDetails
 * @property {string} id - The ID of the show.
 * @property {string} title - The title of the show.
 * @property {string} description - The description of the show.
 * @property {Season[]} seasons - The seasons array.
 * @property {string} image - The cover image URL.
 * @property {number[]} genres - Genre IDs.
 * @property {string} updated - Last updated ISO date string.
 */

/**
 * PodcastDetailModal Component
 * 
 * @param {Object} props
 * @param {string} props.showId - The ID of the show to fetch details for.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.onPlayEpisode - Callback function to start playing a track. Receives (episode, showTitle, showImage).
 * @param {Object} [props.currentEpisode] - Currently playing episode (to show an active equalizer/playing icon).
 */
export default function PodcastDetailModal({
  showId,
  onClose,
  onPlayEpisode,
  currentEpisode
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(null);
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);

  // Fetch show details on mount/ID change
  useEffect(() => {
    if (!showId) return;

    const fetchShowDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://podcast-api.netlify.app/id/${showId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch podcast details. Please try again.');
        }
        const data = await response.json();
        setShow(data);
        setSelectedSeasonIdx(0); // Default to the first season
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [showId]);

  // Click outside backdrop to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent scroll propagation to body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const genresMapped = React.useMemo(() => {
    if (!show || !show.genres) return [];
    return show.genres
      .map((genreId) => {
        const found = genreList.find((g) => g.id === Number(genreId) || g.id === genreId);
        return found ? found.title : '';
      })
      .filter(Boolean);
  }, [show]);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Modal Header Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1rem 1.25rem 0.5rem 1.25rem',
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 10
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '4rem', gap: '1rem' }}>
            <div className="spinner"></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading podcast episodes...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '4rem', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>⚠️</div>
            <h3 style={{ color: '#ef4444' }}>Error Loading Podcast Details</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{error}</p>
            <button className="btn btn-secondary" onClick={onClose}>Close Window</button>
          </div>
        )}

        {/* Content Loaded State */}
        {!loading && !error && show && (
          <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flexGrow: 1 }}>
            
            {/* Show Banner / Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                padding: '2rem 2rem 1.5rem 2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)',
                position: 'relative'
              }}
              className="flex-md-row"
            >
              {/* Responsive Layout styling directly */}
              <style>{`
                @media (min-width: 640px) {
                  .modal-info-layout {
                    flex-direction: row !important;
                    align-items: flex-start !important;
                  }
                  .modal-cover-img {
                    width: 140px !important;
                    height: 140px !important;
                  }
                }
              `}</style>
              <div className="modal-info-layout" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <img
                  className="modal-cover-img"
                  src={show.image}
                  alt={show.title}
                  style={{
                    width: '180px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {genresMapped.map((genre, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: 'rgba(217, 70, 239, 0.1)',
                          color: '#f472b6',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(217, 70, 239, 0.2)'
                        }}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <h2 style={{ fontSize: '1.75rem', lineHeight: '1.2', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>
                    {show.title}
                  </h2>

                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      marginTop: '0.5rem',
                      maxHeight: '100px',
                      overflowY: 'auto',
                      paddingRight: '0.5rem'
                    }}
                  >
                    {show.description}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Layers size={14} />
                      {show.seasons.length} {show.seasons.length === 1 ? 'Season' : 'Seasons'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Season Selector Tabs */}
            <div
              style={{
                padding: '0.75rem 2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: 'rgba(9, 13, 22, 0.4)'
              }}
            >
              <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Select Season
              </span>
              
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem'
                }}
              >
                {show.seasons.map((season, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSeasonIdx(index)}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      border: '1px solid',
                      borderColor: selectedSeasonIdx === index ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                      background: selectedSeasonIdx === index ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      color: selectedSeasonIdx === index ? '#818cf8' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSeasonIdx !== index) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.color = '#fff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSeasonIdx !== index) {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {season.title || `Season ${season.season}`} ({season.episodes?.length || 0} eps)
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes List */}
            <div style={{ padding: '1.5rem 2rem', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Episodes
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                  ({show.seasons[selectedSeasonIdx]?.episodes?.length || 0} total)
                </span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {show.seasons[selectedSeasonIdx]?.episodes?.map((episode, index) => {
                  const isPlaying = currentEpisode && currentEpisode.file === episode.file;
                  
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isPlaying ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: isPlaying ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'var(--transition-fast)'
                      }}
                      className="episode-item"
                    >
                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isPlaying ? 'var(--primary)' : 'var(--text-muted)' }}>
                          EPISODE {episode.episode || index + 1}
                        </span>
                        
                        <h4 style={{ fontSize: '0.95rem', color: isPlaying ? '#818cf8' : 'var(--text-primary)', fontWeight: '600' }}>
                          {episode.title}
                        </h4>
                        
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '0.2rem' }}>
                          {episode.description}
                        </p>
                      </div>

                      <button
                        onClick={() => onPlayEpisode(episode, show.title, show.image)}
                        style={{
                          flexShrink: 0,
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isPlaying ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          cursor: 'pointer',
                          boxShadow: isPlaying ? '0 4px 12px var(--primary-glow)' : 'none',
                          transition: 'var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08)';
                          if (!isPlaying) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          if (!isPlaying) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                        }}
                        title={isPlaying ? "Playing" : "Play Episode"}
                      >
                        {isPlaying ? (
                          <Activity size={18} className="animate-pulse" style={{ color: '#fff' }} />
                        ) : (
                          <Play size={18} fill="#fff" style={{ marginLeft: '1px' }} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
