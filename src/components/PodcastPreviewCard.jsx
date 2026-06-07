import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Play, Layers } from 'lucide-react';
import { genres as genreList } from '../../data.js';

/**
 * @typedef {Object} PodcastPreviewProps
 * @property {string} id - The unique identifier of the podcast show.
 * @property {string} title - The title of the podcast.
 * @property {string} description - A short description of the podcast.
 * @property {number} seasons - The total number of seasons available.
 * @property {string} image - The URL of the podcast cover image.
 * @property {number[]} genres - An array of genre IDs associated with the podcast.
 * @property {string} updated - The ISO date string of the last update.
 * @property {function} onClick - Callback function triggered when the card is clicked.
 */

/**
 * PodcastPreviewCard Component
 * Displays a summarized card for a podcast show in the landing page grid.
 * 
 * @param {PodcastPreviewProps} props - The props for the component.
 * @returns {JSX.Element} The rendered podcast preview card.
 */
export default function PodcastPreviewCard({
  id,
  title,
  description,
  seasons,
  image,
  genres,
  updated,
  onClick
}) {
  // Resolve genre IDs to actual genre titles from the local data file
  const genreNames = React.useMemo(() => {
    if (!genres || !Array.isArray(genres)) return [];
    return genres
      .map((genreId) => {
        const found = genreList.find((g) => g.id === genreId);
        return found ? found.title : '';
      })
      .filter((name) => name !== '');
  }, [genres]);

  // Format the updated ISO date string into a relative format (e.g. "3 years ago")
  const relativeDate = React.useMemo(() => {
    if (!updated) return 'Unknown';
    try {
      const date = new Date(updated);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return updated;
    }
  }, [updated]);

  return (
    <div 
      className="glass-panel group relative flex flex-col overflow-hidden cursor-pointer"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Cover Image Container */}
      <div 
        style={{
          position: 'relative',
          paddingTop: '65%',
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <img 
          src={image} 
          alt={title}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="group-hover:scale-105"
        />
        
        {/* Play Icon Hover Overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(9, 13, 22, 0.9) 0%, rgba(9, 13, 22, 0.3) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'var(--transition-smooth)'
          }}
          className="group-hover:opacity-100"
        >
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              transform: 'scale(0.8)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            className="group-hover:scale-100"
          >
            <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: '2px' }} />
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div 
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'between',
          gap: '0.75rem'
        }}
      >
        <div style={{ flexGrow: 1 }}>
          {/* Genre Badges */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              marginBottom: '0.5rem'
            }}
          >
            {genreNames.map((name, index) => (
              <span 
                key={index}
                style={{
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: '#818cf8',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
              >
                {name}
              </span>
            ))}
          </div>

          {/* Show Title */}
          <h3 
            style={{
              fontSize: '1.15rem',
              lineHeight: '1.4',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              transition: 'color var(--transition-fast)'
            }}
            className="group-hover:text-indigo-400"
          >
            {title}
          </h3>

          {/* Short description */}
          <p 
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              marginBottom: '1rem'
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer info (Seasons & Date) */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '0.75rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={14} />
            <span>{seasons} {seasons === 1 ? 'Season' : 'Seasons'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} />
            <span>{relativeDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
