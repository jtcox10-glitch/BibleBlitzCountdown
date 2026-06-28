import React, { useState } from 'react'
import { DIFFICULTY_CONFIG } from '../data/questions.js'
import { buildShareText } from '../utils/storage.js'
import { getDayKey, getNextResetTime } from '../data/questions.js'

export default function ResultScreen({ result, player, onHome, onLeaderboard }) {
  const [copied, setCopied] = useState(false)

  if (!result) return null

  const { score, correct, total, answerLog, maxPossible } = result
  const pct = Math.round((score / maxPossible) * 100)
  const dayKey = getDayKey()
  const nextReset = getNextResetTime()
  const now = new Date()
  const msLeft = nextReset - now
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60))
  const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60))

  const shareText = buildShareText(result, player?.name)

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText })
      } else {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {}
    }
  }

  function getGrade() {
    if (pct >= 90) return { label: 'LEGENDARY', color: '#f5c842' }
    if (pct >= 75) return { label: 'EXCELLENT', color: '#4ade80' }
    if (pct >= 55) return { label: 'GREAT', color: '#60a5fa' }
    if (pct >= 35) return { label: 'GOOD', color: '#f97316' }
    return { label: 'KEEP GOING', color: '#ef4444' }
  }

  const grade = getGrade()

  return (
    <div className="screen result-screen">
      <div className="result-card">
        <div className="result-header">
          <div className="result-grade" style={{ color: grade.color }}>{grade.label}</div>
          {player && <div className="result-player">{player.name}</div>}
          <div className="result-day">📅 {dayKey}</div>
        </div>

        <div className="result-score-big">{score.toLocaleString()}</div>
        <div className="result-pts-label">points</div>

        <div className="result-stats-row">
          <div className="rstat">
            <div className="rstat-val">{correct}/{total}</div>
            <div className="rstat-label">Correct</div>
          </div>
          <div className="rstat">
            <div className="rstat-val">{pct}%</div>
            <div className="rstat-label">of Max</div>
          </div>
          <div className="rstat">
            <div className="rstat-val">{maxPossible.toLocaleString()}</div>
            <div className="rstat-label">Max Pts</div>
          </div>
        </div>

        {/* Emoji grid */}
        <div className="result-emoji-grid">
          {answerLog.map((a, i) => (
            <span key={i} className="result-emoji">
              {!a.answered ? '⬛' : a.correct
                ? DIFFICULTY_CONFIG[a.difficulty].emoji
                : '❌'}
            </span>
          ))}
        </div>

        {/* Legend */}
        <div className="emoji-legend">
          <span>🟢 Easy</span><span>🟡 Medium</span><span>🟠 Hard</span><span>🔴 Expert</span><span>❌ Wrong</span><span>⬛ Skipped</span>
        </div>

        {/* Breakdown */}
        <div className="breakdown-section">
          <div className="breakdown-title">Score Breakdown</div>
          {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => {
            const qs = answerLog.filter(a => a.difficulty === key)
            const got = qs.filter(a => a.correct).length
            const total_d = qs.length
            const pts = got * cfg.points
            if (total_d === 0) return null
            return (
              <div key={key} className="breakdown-row">
                <span className="bd-dot" style={{ background: cfg.color }} />
                <span className="bd-label">{cfg.label}</span>
                <span className="bd-tally">{got}/{total_d}</span>
                <div className="bd-bar-track">
                  <div className="bd-bar-fill" style={{ width: `${total_d > 0 ? (got/total_d)*100 : 0}%`, background: cfg.color }} />
                </div>
                <span className="bd-pts">+{pts.toLocaleString()}</span>
              </div>
            )
          })}
        </div>

        {/* Share button */}
        <button className="btn btn-share" onClick={handleShare}>
          {copied ? '✓ Copied!' : '📤 Share Score'}
        </button>

        <div className="share-preview">{shareText}</div>

        <div className="result-next">
          Next game in <strong>{hoursLeft}h {minsLeft}m</strong>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn btn-secondary" onClick={onLeaderboard}>🏆 Leaderboard</button>
        <button className="btn btn-ghost" onClick={onHome}>← Home</button>
      </div>
    </div>
  )
}
