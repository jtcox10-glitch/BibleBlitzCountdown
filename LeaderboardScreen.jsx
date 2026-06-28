import React, { useState, useEffect } from 'react'
import { getLeaderboardForPeriod, getLeaderboard } from '../utils/storage.js'

export default function LeaderboardScreen({ player, onBack }) {
  const [tab, setTab] = useState('30')
  const [data30, setData30] = useState([])
  const [data90, setData90] = useState([])
  const [dataStreak, setDataStreak] = useState([])

  useEffect(() => {
    const d30 = getLeaderboardForPeriod(30)
    const d90 = getLeaderboardForPeriod(90)
    const raw = getLeaderboard()
    const streakData = raw
      .map(p => ({ playerId: p.playerId, name: p.name, streak: p.streak || 0 }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 20)
    setData30(d30)
    setData90(d90)
    setDataStreak(streakData)
  }, [])

  const currentData = tab === '30' ? data30 : tab === '90' ? data90 : dataStreak

  const getMyRank = (arr) => {
    if (!player) return null
    const idx = arr.findIndex(e => e.playerId === player.id)
    return idx === -1 ? null : idx + 1
  }

  function medalFor(rank) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className="screen leaderboard-screen">
      <div className="lb-header">
        <button className="btn btn-ghost btn-back" onClick={onBack}>← Back</button>
        <h1 className="lb-title">⚡ Leaderboard</h1>
        {player && <div className="lb-player-name">{player.name}</div>}
      </div>

      <div className="lb-tabs">
        <button className={`lb-tab ${tab === '30' ? 'active' : ''}`} onClick={() => setTab('30')}>30-Day Pts</button>
        <button className={`lb-tab ${tab === '90' ? 'active' : ''}`} onClick={() => setTab('90')}>90-Day Pts</button>
        <button className={`lb-tab ${tab === 'streak' ? 'active' : ''}`} onClick={() => setTab('streak')}>🔥 Streak</button>
      </div>

      {currentData.length === 0 ? (
        <div className="lb-empty">
          <div className="lb-empty-icon">📖</div>
          <p>No scores yet — play today's game to appear here!</p>
        </div>
      ) : (
        <>
          {player && getMyRank(currentData) && (
            <div className="lb-my-rank">
              You are ranked <strong>#{getMyRank(currentData)}</strong> of {currentData.length}
            </div>
          )}
          <div className="lb-list">
            {currentData.slice(0, 20).map((entry, i) => {
              const rank = i + 1
              const medal = medalFor(rank)
              const isMe = player && entry.playerId === player.id
              return (
                <div key={entry.playerId} className={`lb-row ${isMe ? 'lb-row-me' : ''} ${rank <= 3 ? 'lb-top3' : ''}`}>
                  <div className="lb-rank">
                    {medal ? <span className="lb-medal">{medal}</span> : <span className="lb-rank-num">#{rank}</span>}
                  </div>
                  <div className="lb-name">
                    {entry.name}
                    {isMe && <span className="lb-you-badge">YOU</span>}
                  </div>
                  <div className="lb-value">
                    {tab === 'streak'
                      ? <><strong>{entry.streak}</strong><span className="lb-unit"> days</span></>
                      : <><strong>{(entry.total || 0).toLocaleString()}</strong><span className="lb-unit"> pts</span></>
                    }
                  </div>
                  {tab !== 'streak' && (
                    <div className="lb-sub">{entry.daysPlayed}d played</div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
      <div className="lb-note">Same questions worldwide · Resets daily at 12pm CST</div>
    </div>
  )
}
