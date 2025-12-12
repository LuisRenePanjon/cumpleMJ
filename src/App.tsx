import { useEffect, useState } from 'react'
import './App.css'
import amorImage from './assets/amor.jpg'

interface Heart {
  id: number
  left: number
  animationDuration: number
  size: number
  delay: number
}

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

type GameStage = 'intro' | 'game' | 'message' | 'question' | 'final'

function App() {
  const [hearts, setHearts] = useState<Heart[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [gameStage, setGameStage] = useState<GameStage>('intro')

  // Game states
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [noClickCount, setNoClickCount] = useState(0)
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Generate floating hearts
    const heartArray: Heart[] = []
    for (let i = 0; i < 15; i++) {
      heartArray.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 8 + Math.random() * 10,
        size: 20 + Math.random() * 30,
        delay: Math.random() * 5
      })
    }
    setHearts(heartArray)

    // Generate particles
    const particleArray: Particle[] = []
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 2
      })
    }
    setParticles(particleArray)

    // Initialize game
    initializeGame()
  }, [])

  const initializeGame = () => {
    const emojis = ['💕', '❤️', '💝', '🌹', '💖', '💗']
    const duplicatedEmojis = [...emojis, ...emojis]
    const shuffled = duplicatedEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
    setCards(shuffled)
  }

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return

    const card = cards.find(c => c.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    const newCards = cards.map(c =>
      c.id === id ? { ...c, isFlipped: true } : c
    )
    setCards(newCards)

    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)
      const [firstId, secondId] = newFlippedCards
      const firstCard = newCards.find(c => c.id === firstId)
      const secondCard = newCards.find(c => c.id === secondId)

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prevCards => prevCards.map(c =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          ))
          setFlippedCards([])

          // Check if game is complete
          const allMatched = newCards.every(c =>
            c.id === firstId || c.id === secondId || c.isMatched
          )
          if (allMatched) {
            setTimeout(() => setGameStage('message'), 800)
          }
        }, 600)
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards => prevCards.map(c =>
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          ))
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const handleStartGame = () => {
    setGameStage('game')
  }

  const handleMessageComplete = () => {
    setGameStage('question')
  }

  const handleNoClick = () => {
    setNoClickCount(noClickCount + 1)
    // Move the button to a random position
    const maxX = window.innerWidth - 200
    const maxY = window.innerHeight - 100
    setNoButtonPosition({
      x: Math.random() * maxX,
      y: Math.random() * maxY
    })
  }

  const handleYesClick = () => {
    setGameStage('final')
  }


  return (
    <div className="container">
      {/* Floating Hearts */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart"
          style={{
            left: `${heart.left}%`,
            animationDuration: `${heart.animationDuration}s`,
            animationDelay: `${heart.delay}s`,
            fontSize: `${heart.size}px`
          }}
        >
          ♥
        </div>
      ))}

      {/* Particles */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      {/* Intro Screen */}
      {gameStage === 'intro' && (
        <div className="message-card show">
          <h1 className="title">Feliz Cumpleaños</h1>
          <h2 className="subtitle">Mi Amor ♥</h2>
          <p className="intro-text">
            Antes de leer tu mensaje especial...
          </p>
          <p className="intro-text">
            ¿Quieres jugar un juego conmigo? 🎮
          </p>
          <button className="start-button" onClick={handleStartGame}>
            ¡Comenzar! 💕
          </button>
        </div>
      )}

      {/* Memory Game */}
      {gameStage === 'game' && (
        <div className="game-container show">
          <h2 className="game-title">Encuentra las parejas 💕</h2>
          <p className="game-moves">Movimientos: {moves}</p>
          <div className="memory-grid">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="card-inner">
                  <div className="card-front">?</div>
                  <div className="card-back">{card.emoji}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Birthday Message */}
      {gameStage === 'message' && (
        <div className="message-card show">
          <h1 className="title">¡Lo lograste! 🎉</h1>
          <h2 className="subtitle">Ahora tu mensaje especial...</h2>

          <div className="message-content">
            <p className="message">
              Mi amor, mi cielo, María Josesita, mi vida, mi todo... 💕 Tantas formas en las que te llamo
              y de las cuales nunca me alcanzaré a describir lo grandiosa que eres. ✨
            </p>
            <p className="message">
              Hoy en un día tan especial como el día que se recuerda que tenemos una grandiosa persona
              a nuestro lado un año más, quiero desearte lo mejor del mundo. 🌟 Estoy muy orgulloso de ti,
              y te mereces lo mejor del mundo. 🎂
            </p>
            <p className="message">
              Yo, tu novio precioso jeje 😄, quiero dedicarte mis más sinceras palabras al decirte
              que eres muy especial para mí. Quiero que seas muy feliz y te amo con todo mi corazón. ❤️
            </p>
            <p className="message celebration" style={{ fontSize: '1.3em', marginTop: '1.5em' }}>
              🎉 ¡Que viva la cumpleañera! 🎉
            </p>
            <p className="message signature">
              Con muchísimo amor, 💖<br />
              René ♥
            </p>
          </div>

          <div className="heart-divider">♥ ♥ ♥</div>

          <button className="continue-button" onClick={handleMessageComplete}>
            Continuar... 💕
          </button>
        </div>
      )}

      {/* Final Question */}
      {gameStage === 'question' && (
        <div className="message-card show">
          <h1 className="question-title">Una última pregunta...</h1>
          <h2 className="final-question">
            ¿Nos amamos por el resto de nuestras vidas?
          </h2>

          {noClickCount > 0 && (
            <p className="no-warning">
              {noClickCount === 1 && "¿Segura? 🥺"}
              {noClickCount === 2 && "¡Vamos! Sabes que sí 💕"}
              {noClickCount === 3 && "¡No puedes escapar del amor! ❤️"}
              {noClickCount >= 4 && "¡Ya ríndete! Solo hay una respuesta correcta 😘"}
            </p>
          )}

          <div className="question-buttons">
            <button className="yes-button" onClick={handleYesClick}>
              ¡Sí! 💕
            </button>
            <button
              className="no-button"
              onClick={handleNoClick}
              style={noClickCount > 0 ? {
                position: 'fixed',
                left: `${noButtonPosition.x}px`,
                top: `${noButtonPosition.y}px`,
                transition: 'all 0.3s ease'
              } : {}}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Final Screen with Photo */}
      {gameStage === 'final' && (
        <div className="message-card show final-card">
          <h1 className="title celebration">¡Sabía que dirías que sí! 🎉</h1>
          <div className="final-image-container">
            <img
              src={amorImage}
              alt="Nosotros"
              className="couple-photo"
            />
          </div>
          <h2 className="final-message">
            Para siempre y más allá... 💕♾️
          </h2>
          <div className="heart-explosion">
            💕 ❤️ 💖 💗 💝 💕 ❤️ 💖
          </div>
        </div>
      )}
    </div>
  )
}

export default App
