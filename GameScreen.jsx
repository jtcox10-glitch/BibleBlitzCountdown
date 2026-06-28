import React, { useState, useEffect, useRef } from 'react'
import { useTimer } from '../hooks/useTimer.js'
import { saveTodayResult } from '../utils/storage.js'
import { DIFFICULTY_CONFIG } from '../data/questions.js'

const GAME_DURATION = 120 // 2 minutes

export default function GameScreen({ questions, onComplete }) {
  const [phase, setPhase] = useState('countdown') // countdown | playing | done
  const [countdownNum, setCountdownNum] = useState(3)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [answerLog, setAnswerLog] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [scorePopups, setScorePopups] = useState([])
  const feedbackRef = useRef(null)

  const handleTimerComplete = () => {
    finishGame()
  }

  const timer = useTimer(GAME_DURATION, handleTimerComplete)

  // 3-2-1 countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdownNum === 0) {
      setPhase('playing')
      timer.start()
      return
    }
    const t = setTimeout(() => setCountdownNum(n => n - 1), 900)
    return () => clearTimeout(t)
  }, [phase, countdownNum])

  function handleAnswer(option) {
    if (selectedAnswer !== null || phase !== 'playing') return

    const q = questions[currentIdx]
    const isCorrect = option === q.answer
    const pts = isCorrect ? q.points : 0

    setSelectedAnswer(option)
    setShowFeedback(true)

    if (isCorrect) {
      setScore(s => s + pts)
      setCorrect(c => c + 1)
      // Score popup
      const popupId = Date.now()
      setScorePopups(p => [...p, { id: popupId, pts }])
      setTimeout(() => setScorePopups(p => p.filter(x => x.id !== popupId)), 1000)
    }

    setAnswerLog(log => [
      ...log,
      { difficulty: q.difficulty, correct: isCorrect, answered: true, pts }
    ])

    // Move on after feedback
    feedbackRef.current = setTimeout(() => {
      setSelectedAnswer(null)
      setShowFeedback(false)
      if (currentIdx + 1 >= questions.length) {
        finishGame()
      } else {
        setCurrentIdx(i => i + 1)
      }
    }, 700)
  }

  function finishGame() {
    clearTimeout(feedbackRef.current)
    timer.pause()
    setPhase('done')

    // Fill remaining questions as unanswered
    const finalLog = [...answerLog]
    for (let i = finalLog.length; i < questions.length; i++) {
      finalLog.push({ difficulty: questions[i].difficulty, correct: false, answered: false, pts: 0 })
    }

    const maxPossible = questions.reduce((sum, q) => sum + q.points, 0)
    const result = {
      score,
      correct,
      total: questions.length,
      answerLog: finalLog,
      maxPossible,
      timeUsed: GAME_DURATION - timer.secondsLeft,
    }

    saveTodayResult(result)
    setTimeout(() => onComplete(result), 600)
  }

  if (phase === 'countdown') {
    return (
      <div className="screen game-screen countdown-screen">
        <div className="countdown-ring">
          <span className="countdown-number">{countdownNum || 'GO!'}</span>
        </div>
        <p className="countdown-label">Get ready…</p>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="screen game-screen">
        <div className="finishing-text">Calculating score…</div>
      </div>
    )
  }

  const q = questions[currentIdx]
  const cfg = DIFFICULTY_CONFIG[q.difficulty]
  const progressPct = (1 - timer.progress) * 100
  const timerDanger = timer.secondsLeft <= 20

  return (
    <div className="screen game-screen">
      {/* Score popups */}
      {scorePopups.map(p => (
        <div key={p.id} className="score-popup">+{p.pts}</div>
      ))}

      {/* Header */}
      <div className="game-header">
        <div className="game-score-display">
          <span className="gs-label">Score</span>
          <span className="gs-value">{score.toLocaleString()}</span>
        </div>
        <div className={`timer-display ${timerDanger ? 'timer-danger' : ''}`}>
          <svg className="timer-ring" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
            <circle
              cx="30" cy="30" r="26"
              fill="none"
              stroke={timerDanger ? '#ef4444' : '#f5c842'}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - timer.progress)}`}
              strokeLinecap="round"
              transform="rotate(-90 30 30)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <span className="timer-text">{timer.display}</span>
        </div>
        <div className="game-progress-display">
          <span className="gp-label">Q</span>
          <span className="gp-value">{currentIdx + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="time-bar-track">
        <div
          className={`time-bar-fill ${timerDanger ? 'time-bar-danger' : ''}`}
          style={{ width: `${timer.progress * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="question-area">
        <div className="difficulty-badge" style={{ background: cfg.color + '22', color: cfg.color, borderColor: cfg.color + '44' }}>
          {cfg.emoji} {cfg.label} · {cfg.points} pts
        </div>
        <div className="question-translation">{q.translation}</div>
        <h2 className="question-text">{q.question}</h2>
      </div>

      {/* Answers */}
      <div className="answers-grid">
        {q.options.map((option, i) => {
          let cls = 'answer-btn'
          if (showFeedback && selectedAnswer !== null) {
            if (option === q.answer) cls += ' answer-correct'
            else if (option === selectedAnswer && option !== q.answer) cls += ' answer-wrong'
            else cls += ' answer-dim'
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
              <span className="answer-text">{option}</span>
            </button>
          )
        })}
      </div>

      {/* Reference (shown on feedback) */}
      {showFeedback && (
        <div className="reference-bar">
          📖 {q.reference}
        </div>
      )}
    </div>
  )
}
