import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Radio } from 'lucide-react';

/**
 * @typedef {Object} EpisodeData
 * @property {string} title - Episode title.
 * @property {string} file - Audio MP3 URL.
 * @property {number} episode - Episode number.
 */

/**
 * AudioPlayer Component
 * 
 * @param {Object} props
 * @param {EpisodeData} props.episode - The episode being played.
 * @param {string} props.showTitle - The title of the podcast show.
 * @param {string} props.showImage - The cover image of the podcast.
 * @param {function} props.onClose - Callback function to stop playback and close the player.
 */
export default function AudioPlayer({
  episode,
  showTitle,
  showImage,
  onClose
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Play audio when a new episode is loaded
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (episode?.file) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Playback prevented or failed:', err));
      }
    }
  }, [episode?.file]);

  // Toggle play/pause state
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Playback failed:', err));
    }
  };

  // Handle time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle loaded metadata (duration)
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Seeker change handler
  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Volume slider change handler
  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);
    if (audioRef.current) {
      audioRef.current.muted = nextMuteState;
      audioRef.current.volume = nextMuteState ? 0 : volume;
    }
  };

  // Audio ended handler
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Format time (seconds to MM:SS or HH:MM:SS)
  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);

    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    if (hours > 0) {
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    }
    return `${minutes}:${formattedSeconds}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.85rem 1.5rem',
        zIndex: 999,
        boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.4)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Hidden native audio tag */}
      <audio
        ref={audioRef}
        src={episode?.file}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      <style>{`
        @media (max-width: 639px) {
          .player-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .player-details {
            margin-bottom: 0.25rem;
          }
          .player-volume {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="player-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 2fr 1fr',
          alignItems: 'center',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Track Details */}
        <div 
          className="player-details"
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}
        >
          {showImage ? (
            <img
              src={showImage}
              alt={showTitle}
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            />
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={20} color="var(--text-muted)" />
            </div>
          )}
          
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {episode?.title}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '0.1rem'
              }}
            >
              {showTitle} {episode?.episode ? `• Episode ${episode.episode}` : ''}
            </span>
          </div>
        </div>

        {/* Media Controls (Center Playback and Seeker) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={togglePlay}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 4px 10px var(--primary-glow)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" style={{ marginLeft: '2px' }} />}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '35px', textAlign: 'right' }}>
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                flexGrow: 1,
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.1)',
                outline: 'none',
                cursor: 'pointer',
                accentColor: 'var(--primary)',
                WebkitAppearance: 'none'
              }}
            />

            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '35px' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Close (Right-aligned controls) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          <div className="player-volume" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={toggleMute}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{
                width: '70px',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.1)',
                outline: 'none',
                cursor: 'pointer',
                accentColor: 'var(--primary)'
              }}
            />
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            title="Close Player"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
