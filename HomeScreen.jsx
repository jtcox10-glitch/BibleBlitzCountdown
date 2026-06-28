import React from 'react'
import { getDayKey, getNextResetTime } from '../data/questions.js'
import { DIFFICULTY_CONFIG } from '../data/questions.js'

export default function HomeScreen({ player, todayResult, onPlay, onLeaderboard }) {
  const dayKey = getDayKey()
  const nextReset = getNextResetTime()
  const now = new Date()
  const msLeft = nextReset - now
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60))
  const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="screen home-screen">
      <header className="home-header">
        <div className="logo-area">
          <span className="logo-bolt">⚡</span>
          <div className="logo-text">
            <span className="logo-bible">BIBLE BLITZ</span>
            <span className="logo-countdown">COUNTDOWN</span>
          </div>
        </div>
        <p className="home-tagline">2 minutes. Every question counts.</p>
      </header>

      <div className="home-body">
        {todayResult ? (
          <div className="today-summary-card">
            <div className="today-label">Today's Result</div>
            <div className="today-score">{todayResult.score.toLocaleString()}</div>
            <div className="today-sub">pts · {todayResult.correct}/{todayResult.total} correct</div>
            <div className="today-emoji-row">
              {todayResult.answerLog.map((a, i) => (
                <span key={i} className="summary-emoji">
                  {!a.answered ? '⬛' : a.correct
                    ? DIFFICULTY_CONFIG[a.difficulty].emoji
                    : '❌'}
                </span>
              ))}
            </div>
            <div className="reset-note">New game in {hoursLeft}h {minsLeft}m</div>
          </div>
        ) : (
          <div className="home-cta-area">
            <div className="day-badge">Day #{dayKey.replace(/-/g, '')}</div>
            <div className="point-legend">
              {Object.values(DIFFICULTY_CONFIG).map(d => (
                <div key={d.label} className="legend-item">
                  <span className="legend-dot" style={{ background: d.color }} />
                  <span>{d.label}</span>
                  <span className="legend-pts">{d.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="home-actions">
          <button className="btn btn-primary btn-xl" onClick={onPlay}>
            {!player ? 'Play Now →' : todayResult ? 'See Results' : 'Play Today\'s Game →'}
          </button>
          <button className="btn btn-secondary" onClick={onLeaderboard}>
            🏆 Leaderboard
          </button>
        </div>

        {player && (
          <div className="player-tag">Playing as <strong>{player.name}</strong></div>
        )}
      </div>

      <footer className="home-footer">
        <p>Same questions for everyone · Resets daily at 12pm CST</p>
      </footer>
    </div>
  )
}
