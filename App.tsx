/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Play, 
  RotateCcw, 
  Pause, 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Skull
} from 'lucide-react';

// Constants
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = 'UP';
const SPEEDS = {
  easy: 150,
  medium: 100,
  hard: 60,
};

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Difficulty = 'easy' | 'medium' | 'hard';

export default function App() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [isPaused, setIsPaused] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastDirectionRef = useRef<Direction>(INITIAL_DIRECTION);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('neon-snake-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore && score > 0) {
      setHighScore(score);
      setIsNewHighScore(true);
      localStorage.setItem('neon-snake-highscore', score.toString());
    }
  }, [score, highScore]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food is on snake
      const onSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastDirectionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsNewHighScore(false);
  };

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Wrap around logic
      if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
      if (newHead.x >= GRID_SIZE) newHead.x = 0;
      if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
      if (newHead.y >= GRID_SIZE) newHead.y = 0;

      // Check self-collision only
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPaused(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10));
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      lastDirectionRef.current = direction;
      return newSnake;
    });
  }, [direction, food, isPaused, isGameOver, difficulty, generateFood]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, SPEEDS[difficulty]);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, difficulty]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (lastDirectionRef.current !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (lastDirectionRef.current !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (lastDirectionRef.current !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (lastDirectionRef.current !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-end mb-6 z-10">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
            NEON SNAKE
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Neural Link: Stable</p>
        </motion.div>
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-end"
        >
          <div className="flex items-center gap-2 text-slate-400 text-[10px] mb-1 uppercase font-mono tracking-wider">
            <Trophy size={12} className="text-yellow-500" />
            <span>Record: {highScore.toString().padStart(6, '0')}</span>
          </div>
          <div className="text-3xl font-black font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {score.toString().padStart(6, '0')}
          </div>
        </motion.div>
      </div>

      {/* Game Board Container */}
      <div className="relative z-10 group">
        {/* Border Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div 
          className="relative bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-2xl"
          style={{ 
            width: 'min(90vw, 400px)', 
            height: 'min(90vw, 400px)',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {/* Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 pointer-events-none opacity-10">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-slate-700" />
            ))}
          </div>

          {/* Food */}
          <motion.div
            layoutId="food"
            className="z-20"
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
            }}
          >
            <div className="w-full h-full p-1">
              <div className="w-full h-full bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse" />
            </div>
          </motion.div>

          {/* Snake */}
          {snake.map((segment, i) => (
            <motion.div
              key={`${i}-${segment.x}-${segment.y}`}
              initial={false}
              className="z-10"
              style={{
                gridColumnStart: segment.x + 1,
                gridRowStart: segment.y + 1,
              }}
            >
              <div className="w-full h-full p-[1px]">
                <div 
                  className={`w-full h-full rounded-sm transition-colors duration-300 ${
                    i === 0 
                      ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' 
                      : 'bg-purple-500/80'
                  }`}
                  style={{
                    opacity: 1 - (i / snake.length) * 0.6
                  }}
                />
              </div>
            </motion.div>
          ))}

          {/* Overlays */}
          <AnimatePresence>
            {(isPaused || isGameOver) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
              >
                {isGameOver ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <Skull size={64} className="text-rose-500 animate-glitch" />
                    </div>
                    
                    <h2 className="text-4xl font-black mb-2 text-rose-500 italic tracking-tighter animate-glitch">
                      SYSTEM CRASH
                    </h2>
                    
                    {isNewHighScore && (
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-yellow-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                      >
                        New Sector Record!
                      </motion.div>
                    )}

                    <div className="flex flex-col gap-1 mb-6">
                      <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Data Harvested</p>
                      <p className="text-2xl font-black text-white font-mono">{score}</p>
                    </div>

                    <button 
                      onClick={resetGame}
                      className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-rose-900/40"
                    >
                      <RotateCcw size={20} /> REBOOT SYSTEM
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Pause size={64} className="text-cyan-400 mb-4" />
                    <h2 className="text-4xl font-black mb-6 text-cyan-400 italic tracking-tight">LINK SUSPENDED</h2>
                    <button 
                      onClick={() => setIsPaused(false)}
                      className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-900/40"
                    >
                      <Play size={20} /> RESUME UPLINK
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls & Settings */}
      <div className="w-full max-w-md mt-8 z-10 flex flex-col gap-6">
        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <div />
          <ControlButton icon={<ChevronUp />} onClick={() => lastDirectionRef.current !== 'DOWN' && setDirection('UP')} />
          <div />
          <ControlButton icon={<ChevronLeft />} onClick={() => lastDirectionRef.current !== 'RIGHT' && setDirection('LEFT')} />
          <ControlButton icon={isPaused ? <Play /> : <Pause />} onClick={() => setIsPaused(!isPaused)} variant="accent" />
          <ControlButton icon={<ChevronRight />} onClick={() => lastDirectionRef.current !== 'LEFT' && setDirection('RIGHT')} />
          <div />
          <ControlButton icon={<ChevronDown />} onClick={() => lastDirectionRef.current !== 'UP' && setDirection('DOWN')} />
          <div />
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Settings size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase">
              <Zap size={14} className={difficulty === 'hard' ? 'text-rose-500' : 'text-cyan-500'} />
              {difficulty}
            </div>
          </div>
          
          <div className="hidden md:flex gap-2 text-[10px] font-mono text-slate-500 uppercase">
            <span className="px-1.5 py-0.5 border border-slate-700 rounded">Arrows</span>
            <span>to move</span>
            <span className="px-1.5 py-0.5 border border-slate-700 rounded ml-2">Space</span>
            <span>to pause</span>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Difficulty Matrix</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDifficulty(d);
                        setShowSettings(false);
                        resetGame();
                      }}
                      className={`py-2 rounded-lg font-bold text-xs uppercase tracking-tighter transition-all ${
                        difficulty === d 
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-8 text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
        Neural Link Established // Sector 7G
      </footer>
    </div>
  );
}

function ControlButton({ 
  icon, 
  onClick, 
  variant = 'default' 
}: { 
  icon: React.ReactNode; 
  onClick: () => void;
  variant?: 'default' | 'accent';
}) {
  return (
    <button
      onClick={onClick}
      className={`aspect-square flex items-center justify-center rounded-xl transition-all active:scale-90 ${
        variant === 'accent' 
          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
          : 'bg-slate-800 text-slate-300 border border-slate-700'
      }`}
    >
      {icon}
    </button>
  );
}
