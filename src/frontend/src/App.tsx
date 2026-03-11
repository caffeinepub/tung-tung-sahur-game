import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ScoreEntry } from "./backend.d.ts";
import { useActor } from "./hooks/useActor";

// ─── Types ─────────────────────────────────────────────────────────────────

type Screen = "start" | "game" | "gameover" | "leaderboard";

interface Particle {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  rotate: number;
  size: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const GAME_DURATION = 30;
const COMBO_WINDOW_MS = 500;
const MAX_COMBO = 5;
const CHAOS_MAX = 100;

const PLAYER_TEXTS = [
  "TUNG!",
  "TUNG TUNG!",
  "SAHUR!!!",
  "BANGUN!",
  "YA ALLAH!",
  "AAHHH!",
  "🥁💥",
  "TUNG TUNG TUNG!",
  "WAKE UP!",
  "SAHUR SAHUR!",
];

const BOT_TEXTS = [
  "BONK!",
  "BONG??",
  "TING?",
  "ERROR!",
  "GLITCH!",
  "TUNG???",
  "WRONG!",
  "🤖💥",
  "BZZZT!",
  "MALFUNCTION!",
];

const BOT_STATUS_MSGS = [
  "BANGING RANDOMLY...",
  "FORGOT WHEN SAHUR IS",
  "TOO EXCITED!!",
  "BONK BONK BONK",
  "ERROR: TOO MUCH DRUM",
  "SYSTEM OVERLOAD",
  "WHAT IS SAHUR??",
  "DRUM GO BRRR",
  "CANNOT STOP BANGING",
  "HALP I'M STUCK",
  "TUNG.EXE CRASHED",
  "BOT NEEDS SLEEP",
];

const CHAOS_EVENT_MSGS = [
  "BOT IS LOSING IT!!!",
  "MAXIMUM CHAOS ACHIEVED!",
  "THE BOT HAS ASCENDED!!",
  "TUNG OVERLOAD!!!",
  "SAHUR EMERGENCY!!!",
  "DRUMS EVERYWHERE!!!",
];

const PLAYER_COLORS = [
  "oklch(0.92 0.22 95)",
  "oklch(0.75 0.22 40)",
  "oklch(0.65 0.25 25)",
  "oklch(0.85 0.20 60)",
];

const BOT_COLORS = [
  "oklch(0.65 0.22 300)",
  "oklch(0.78 0.22 142)",
  "oklch(0.80 0.18 200)",
  "oklch(0.72 0.25 320)",
];

// ─── Helpers ───────────────────────────────────────────────────────────────

let particleId = 0;
function nextId() {
  return ++particleId;
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── StartScreen ──────────────────────────────────────────────────────────

function StartScreen({
  onStart,
  onLeaderboard,
}: {
  onStart: () => void;
  onLeaderboard: () => void;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(iv);
  }, []);

  const titleColors = [
    "oklch(0.92 0.22 95)",
    "oklch(0.75 0.22 40)",
    "oklch(0.65 0.25 25)",
    "oklch(0.78 0.22 142)",
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full px-4 py-8 select-none">
      {/* Decorative background drums */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {(["a", "b", "c", "d", "e", "f", "g", "h"] as const).map((id, i) => (
          <div
            key={`bg-drum-${id}`}
            className="absolute text-2xl opacity-10"
            style={{
              left: `${(i * 13 + 5) % 100}%`,
              top: `${(i * 17 + 8) % 100}%`,
              transform: `rotate(${i * 45}deg)`,
              animation: `bot-bob ${1.5 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            🥁
          </div>
        ))}
      </div>

      {/* Title */}
      <div className="text-center mt-4 animate-fade-in-up">
        <div
          className="font-display font-black leading-tight animate-title-wiggle"
          style={{
            fontSize: "clamp(2.5rem, 10vw, 4rem)",
            textShadow: "4px 4px 0 rgba(0,0,0,0.5)",
          }}
        >
          {["TUNG", " TUNG", " TUNG", " SAHUR!"].map((part, i) => (
            <span
              key={`title-${part.trim()}`}
              style={{ color: titleColors[i] }}
            >
              {part}
            </span>
          ))}
        </div>
        <div
          className="font-display font-black text-base sm:text-lg mt-2"
          style={{ color: "oklch(0.65 0.22 300)" }}
        >
          🤖 FEATURING: THE DUMB BOT 🤖
        </div>
      </div>

      {/* Bot character */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="animate-bot-bob"
          style={{
            fontSize: "clamp(4rem, 20vw, 7rem)",
            filter: "drop-shadow(0 0 20px oklch(0.65 0.22 300 / 60%))",
          }}
        >
          🤖
        </div>
        <div
          className="font-display font-black text-base px-4 py-2 rounded-full border-2"
          style={{
            color: "oklch(0.65 0.22 300)",
            borderColor: "oklch(0.65 0.22 300)",
            background: "oklch(0.65 0.22 300 / 10%)",
          }}
        >
          {tick % 2 === 0 ? "TUNG TUNG TUNG..." : "🥁 BANG BANG BANG..."}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          type="button"
          data-ocid="game.start_button"
          onClick={onStart}
          className="font-display font-black py-5 px-8 rounded-2xl transition-all duration-100 active:scale-95 hover:scale-105 w-full"
          style={{
            fontSize: "clamp(1.2rem, 5vw, 1.5rem)",
            background: "oklch(0.92 0.22 95)",
            color: "oklch(0.1 0.005 270)",
            boxShadow:
              "0 6px 0 oklch(0.65 0.18 80), 0 8px 20px oklch(0.92 0.22 95 / 40%)",
          }}
        >
          🥁 BANG THE DRUM!
        </button>
        <button
          type="button"
          data-ocid="game.leaderboard_button"
          onClick={onLeaderboard}
          className="font-display font-black text-lg py-3 px-8 rounded-2xl transition-all duration-100 active:scale-95 hover:scale-105 w-full border-2"
          style={{
            background: "transparent",
            color: "oklch(0.80 0.18 200)",
            borderColor: "oklch(0.80 0.18 200)",
          }}
        >
          🏆 LEADERBOARD
        </button>
      </div>

      {/* Footer */}
      <div
        className="text-center text-xs"
        style={{ color: "oklch(0.4 0.01 270)" }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
          style={{ color: "oklch(0.5 0.05 270)" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}

// ─── GameScreen ────────────────────────────────────────────────────────────

function GameScreen({
  onGameOver,
}: {
  onGameOver: (playerScore: number, botChaos: number) => void;
}) {
  const [score, setScore] = useState(0);
  const [botChaos, setBotChaos] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [combo, setCombo] = useState(1);
  const [comboKey, setComboKey] = useState(0);
  const [scoreKey, setScoreKey] = useState(0);
  const [drumBouncing, setDrumBouncing] = useState(false);
  const [drumKey, setDrumKey] = useState(0);
  const [botBanging, setBotBanging] = useState(false);
  const [botStatus, setBotStatus] = useState("READY TO BANG...");
  const [chaosLevel, setChaosLevel] = useState(0);
  const [chaosEventActive, setChaosEventActive] = useState(false);
  const [chaosEventMsg, setChaosEventMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const lastClickRef = useRef<number>(0);
  const comboRef = useRef(1);
  const gameActiveRef = useRef(true);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(
    new Set(),
  );
  const scoreRef = useRef(0);
  const botChaosRef = useRef(0);
  const chaosLevelRef = useRef(0);
  const drumRef = useRef<HTMLButtonElement>(null);

  // Timer countdown
  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(iv);
          gameActiveRef.current = false;
          onGameOver(scoreRef.current, botChaosRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onGameOver]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      particleTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const spawnParticle = useCallback((isBot: boolean) => {
    const colors = isBot ? BOT_COLORS : PLAYER_COLORS;
    const texts = isBot ? BOT_TEXTS : PLAYER_TEXTS;
    const rect = drumRef.current?.getBoundingClientRect();
    const xBase = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const yBase = rect ? rect.top : window.innerHeight * 0.6;

    const particle: Particle = {
      id: nextId(),
      text: getRandom(texts),
      x: xBase + getRandomInt(-90, 90),
      y: yBase + getRandomInt(-10, 20),
      color: getRandom(colors),
      rotate: getRandomInt(-25, 25),
      size: getRandomInt(18, 34),
    };

    setParticles((prev) => [...prev, particle]);

    const t = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== particle.id));
      particleTimeoutsRef.current.delete(t);
    }, 950);
    particleTimeoutsRef.current.add(t);
  }, []);

  const triggerChaosEvent = useCallback(() => {
    const msg = getRandom(CHAOS_EVENT_MSGS);
    setChaosEventMsg(msg);
    setChaosEventActive(true);
    setIsShaking(true);
    chaosLevelRef.current = 0;
    setChaosLevel(0);

    // Burst particles
    for (let i = 0; i < 10; i++) {
      const t = setTimeout(() => {
        if (gameActiveRef.current) spawnParticle(true);
      }, i * 70);
      particleTimeoutsRef.current.add(t);
    }

    const t1 = setTimeout(() => {
      if (gameActiveRef.current) {
        setChaosEventActive(false);
        setIsShaking(false);
      }
    }, 1200);
    particleTimeoutsRef.current.add(t1);
  }, [spawnParticle]);

  const doBotHit = useCallback(() => {
    if (!gameActiveRef.current) return;
    setBotBanging(true);
    const t = setTimeout(() => {
      if (gameActiveRef.current) setBotBanging(false);
    }, 500);
    particleTimeoutsRef.current.add(t);

    botChaosRef.current += 1;
    setBotChaos(botChaosRef.current);
    spawnParticle(true);

    const addedChaos = getRandomInt(8, 18);
    chaosLevelRef.current += addedChaos;
    if (chaosLevelRef.current >= CHAOS_MAX) {
      triggerChaosEvent();
    } else {
      setChaosLevel(Math.min(chaosLevelRef.current, CHAOS_MAX));
    }
  }, [spawnParticle, triggerChaosEvent]);

  // Bot brain scheduler
  const scheduleBotAction = useCallback(() => {
    if (!gameActiveRef.current) return;

    const delay = getRandomInt(200, 2200);
    botTimeoutRef.current = setTimeout(() => {
      if (!gameActiveRef.current) return;

      const pattern = getRandomInt(1, 4);

      if (pattern === 1) {
        // Burst 3-6
        const burstCount = getRandomInt(3, 6);
        for (let i = 0; i < burstCount; i++) {
          const bt = setTimeout(doBotHit, i * getRandomInt(80, 200));
          particleTimeoutsRef.current.add(bt);
        }
      } else if (pattern === 2) {
        // Single hit
        doBotHit();
      } else if (pattern === 3) {
        // Double tap
        doBotHit();
        const bt = setTimeout(doBotHit, getRandomInt(150, 350));
        particleTimeoutsRef.current.add(bt);
      } else {
        // Triple erratic
        doBotHit();
        const bt1 = setTimeout(doBotHit, getRandomInt(100, 500));
        const bt2 = setTimeout(doBotHit, getRandomInt(600, 1300));
        particleTimeoutsRef.current.add(bt1);
        particleTimeoutsRef.current.add(bt2);
      }

      scheduleBotAction();
    }, delay);
  }, [doBotHit]);

  useEffect(() => {
    scheduleBotAction();
    statusIntervalRef.current = setInterval(() => {
      if (gameActiveRef.current) {
        setBotStatus(getRandom(BOT_STATUS_MSGS));
      }
    }, 2000);
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, [scheduleBotAction]);

  const handleDrumClick = useCallback(() => {
    if (!gameActiveRef.current) return;

    const now = Date.now();
    const timeSince = now - lastClickRef.current;

    let newCombo = comboRef.current;
    if (timeSince < COMBO_WINDOW_MS) {
      newCombo = Math.min(newCombo + 1, MAX_COMBO);
    } else {
      newCombo = 1;
    }
    lastClickRef.current = now;
    comboRef.current = newCombo;
    setCombo(newCombo);
    if (newCombo > 1) setComboKey((k) => k + 1);

    scoreRef.current += newCombo;
    setScore(scoreRef.current);
    setScoreKey((k) => k + 1);

    // Trigger drum animation
    setDrumKey((k) => k + 1);
    setDrumBouncing(true);
    const t = setTimeout(() => setDrumBouncing(false), 400);
    particleTimeoutsRef.current.add(t);

    spawnParticle(false);
  }, [spawnParticle]);

  const isTimeLow = timeLeft <= 10;
  const chaosPercent = (chaosLevel / CHAOS_MAX) * 100;

  return (
    <div
      className={`relative flex flex-col h-full overflow-hidden select-none ${isShaking ? "animate-screen-shake" : ""} ${chaosEventActive ? "animate-chaos-flash" : ""}`}
    >
      {/* Particle layer */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-50 animate-tung-fly font-display font-black"
          style={
            {
              left: p.x,
              top: p.y,
              color: p.color,
              fontSize: `${p.size}px`,
              "--tung-rotate": `${p.rotate}deg`,
              textShadow: "2px 2px 0 rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
              transform: "translateX(-50%)",
            } as React.CSSProperties
          }
        >
          {p.text}
        </div>
      ))}

      {/* Chaos event overlay */}
      {chaosEventActive && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div
            className="font-display font-black text-2xl sm:text-3xl text-center px-6 py-4 rounded-2xl animate-chaos-event-text"
            style={{
              color: "oklch(0.65 0.22 300)",
              background: "oklch(0.14 0.01 270 / 92%)",
              border: "3px solid oklch(0.65 0.22 300)",
              boxShadow: "0 0 40px oklch(0.65 0.22 300 / 50%)",
            }}
          >
            ⚡ {chaosEventMsg} ⚡
          </div>
        </div>
      )}

      {/* Header: scores + timer */}
      <div className="flex items-stretch justify-between px-3 pt-3 pb-2 gap-2">
        {/* Player score */}
        <div
          className="flex-1 rounded-xl p-2 text-center"
          style={{ background: "oklch(0.14 0.01 270)" }}
        >
          <div
            className="font-display font-black text-xs"
            style={{ color: "oklch(0.92 0.22 95)" }}
          >
            SCORE
          </div>
          <div
            key={scoreKey}
            data-ocid="game.score_display"
            className="font-display font-black text-2xl sm:text-3xl animate-score-pop"
            style={{ color: "oklch(0.92 0.22 95)" }}
          >
            {score}
          </div>
          {combo > 1 && (
            <div
              key={comboKey}
              className="font-display font-black text-xs animate-combo-pop"
              style={{ color: "oklch(0.75 0.22 40)" }}
            >
              ×{combo} COMBO!
            </div>
          )}
        </div>

        {/* Timer */}
        <div
          className={`flex-1 rounded-xl p-2 text-center ${isTimeLow ? "animate-timer-pulse" : ""}`}
          style={{
            background: "oklch(0.14 0.01 270)",
            border: isTimeLow
              ? "2px solid oklch(0.65 0.25 25)"
              : "2px solid transparent",
          }}
        >
          <div
            className="font-display font-black text-xs"
            style={{
              color: isTimeLow ? "oklch(0.65 0.25 25)" : "oklch(0.80 0.18 200)",
            }}
          >
            TIME
          </div>
          <div
            data-ocid="game.timer_display"
            className="font-display font-black text-2xl sm:text-3xl"
            style={{
              color: isTimeLow ? "oklch(0.65 0.25 25)" : "oklch(0.80 0.18 200)",
            }}
          >
            {timeLeft}s
          </div>
        </div>

        {/* Bot chaos */}
        <div
          className="flex-1 rounded-xl p-2 text-center"
          style={{ background: "oklch(0.14 0.01 270)" }}
        >
          <div
            className="font-display font-black text-xs"
            style={{ color: "oklch(0.65 0.22 300)" }}
          >
            BOT CHAOS
          </div>
          <div
            className="font-display font-black text-2xl sm:text-3xl"
            style={{ color: "oklch(0.65 0.22 300)" }}
          >
            {botChaos}
          </div>
        </div>
      </div>

      {/* Chaos meter */}
      <div className="px-3 mb-1">
        <div className="flex items-center justify-between mb-1">
          <span
            className="font-display font-black text-xs"
            style={{ color: "oklch(0.65 0.22 300)" }}
          >
            ⚡ CHAOS METER
          </span>
          <span
            className="font-display font-black text-xs"
            style={{ color: "oklch(0.65 0.22 300)" }}
          >
            {Math.round(chaosPercent)}%
          </span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "oklch(0.16 0.01 270)" }}
        >
          <div
            className={`h-full rounded-full transition-all duration-150 ${chaosPercent > 80 ? "chaos-bar-glow" : ""}`}
            style={{
              width: `${chaosPercent}%`,
              background:
                "linear-gradient(90deg, oklch(0.65 0.22 300), oklch(0.80 0.18 200))",
            }}
          />
        </div>
      </div>

      {/* Bot status strip */}
      <div className="flex items-center gap-2 px-3 pb-2">
        <div
          className={`text-4xl ${botBanging ? "animate-bot-bang" : "animate-bot-bob"}`}
          style={{
            filter: "drop-shadow(0 0 10px oklch(0.65 0.22 300 / 50%))",
          }}
        >
          🤖
        </div>
        <div>
          <div
            className="font-display font-black text-sm"
            style={{ color: "oklch(0.65 0.22 300)" }}
          >
            DUMB BOT
          </div>
          <div
            className="font-display text-xs"
            style={{ color: "oklch(0.5 0.03 270)" }}
          >
            {botStatus}
          </div>
        </div>
        <div className="ml-auto text-2xl">{botBanging ? "🥁💥" : "🥁"}</div>
      </div>

      {/* Main drum */}
      <div className="flex-1 flex items-center justify-center">
        <button
          type="button"
          ref={drumRef}
          data-ocid="game.drum_button"
          onClick={handleDrumClick}
          key={drumKey}
          className={`relative flex flex-col items-center justify-center rounded-full font-display font-black ${drumBouncing ? "animate-drum-bounce" : "drum-idle-pulse"}`}
          style={{
            width: "min(55vw, 200px)",
            height: "min(55vw, 200px)",
            background:
              "radial-gradient(circle at 40% 35%, oklch(0.92 0.22 95), oklch(0.65 0.18 80))",
            boxShadow:
              "0 8px 0 oklch(0.55 0.15 80), 0 12px 32px oklch(0.92 0.22 95 / 30%)",
            color: "oklch(0.1 0.005 270)",
            WebkitTapHighlightColor: "transparent",
            userSelect: "none",
            touchAction: "manipulation",
          }}
        >
          <div style={{ fontSize: "clamp(2.5rem, 10vw, 3.5rem)" }}>🥁</div>
          <div
            className="font-black"
            style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.2rem)" }}
          >
            BANG!
          </div>
          <div
            style={{ fontSize: "clamp(0.6rem, 2.5vw, 0.75rem)", opacity: 0.6 }}
          >
            TAP / CLICK
          </div>
          {combo > 1 && (
            <div
              className="absolute -top-2 -right-2 rounded-full font-black text-xs px-2 py-1"
              style={{
                background: "oklch(0.75 0.22 40)",
                color: "oklch(0.1 0.005 270)",
              }}
            >
              ×{combo}
            </div>
          )}
        </button>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}

// ─── GameOverScreen ────────────────────────────────────────────────────────

function GameOverScreen({
  playerScore,
  botChaos,
  onPlayAgain,
  onLeaderboard,
}: {
  playerScore: number;
  botChaos: number;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
}) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<bigint | null>(null);

  const getFunnyMessage = () => {
    if (playerScore > botChaos * 2)
      return "YOU ABSOLUTELY DESTROYED THE BOT! 🏆";
    if (playerScore > botChaos) return "YOU WIN! THE BOT IS CONFUSED 🤖";
    if (playerScore === botChaos) return "IT'S A TIE... BOTH EQUALLY DUMB 🤝";
    if (botChaos > playerScore * 2) return "THE BOT WENT ABSOLUTELY FERAL 🤖💀";
    return "THE BOT SOMEHOW BEAT YOU?! 😱";
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.submitScore(name.trim(), BigInt(playerScore));
      const r = await actor.getPlayerRank(BigInt(playerScore));
      return r;
    },
    onSuccess: (r) => {
      setRank(r);
      setSubmitted(true);
    },
  });

  const handleSubmit = () => {
    if (!name.trim() || submitMutation.isPending) return;
    submitMutation.mutate();
  };

  return (
    <div className="flex flex-col items-center justify-between h-full px-4 py-6 overflow-y-auto gap-4">
      {/* Title */}
      <div className="text-center animate-fade-in-up">
        <div
          className="font-display font-black leading-tight"
          style={{
            fontSize: "clamp(2rem, 8vw, 3rem)",
            color: "oklch(0.65 0.25 25)",
            textShadow: "3px 3px 0 rgba(0,0,0,0.6)",
          }}
        >
          TIME'S UP! ⏰
        </div>
        <div
          className="font-display font-black text-lg sm:text-xl mt-1"
          style={{ color: "oklch(0.92 0.22 95)" }}
        >
          SAHUR IS OVER!!!
        </div>
      </div>

      {/* Score cards */}
      <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: "oklch(0.14 0.01 270)",
            border: "2px solid oklch(0.92 0.22 95)",
          }}
        >
          <div>
            <div
              className="font-display font-black text-xs"
              style={{ color: "oklch(0.92 0.22 95)" }}
            >
              YOUR SCORE
            </div>
            <div
              className="font-display font-black text-4xl"
              style={{ color: "oklch(0.92 0.22 95)" }}
            >
              {playerScore}
            </div>
          </div>
          <div className="text-5xl">🥁</div>
        </div>
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: "oklch(0.14 0.01 270)",
            border: "2px solid oklch(0.65 0.22 300)",
          }}
        >
          <div>
            <div
              className="font-display font-black text-xs"
              style={{ color: "oklch(0.65 0.22 300)" }}
            >
              BOT CHAOS
            </div>
            <div
              className="font-display font-black text-4xl"
              style={{ color: "oklch(0.65 0.22 300)" }}
            >
              {botChaos}
            </div>
          </div>
          <div className="text-5xl">🤖</div>
        </div>
        <div
          className="font-display font-black text-sm text-center py-2 rounded-xl"
          style={{
            color: "oklch(0.78 0.22 142)",
            background: "oklch(0.78 0.22 142 / 10%)",
          }}
        >
          {getFunnyMessage()}
        </div>
      </div>

      {/* Submit section */}
      {!submitted ? (
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div
            className="font-display font-black text-xs text-center"
            style={{ color: "oklch(0.6 0.03 270)" }}
          >
            ENTER YOUR NAME FOR THE LEADERBOARD:
          </div>
          <input
            data-ocid="game.name_input"
            type="text"
            placeholder="YOUR NAME..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            maxLength={20}
            className="w-full rounded-xl px-4 py-3 font-display font-black text-lg text-center outline-none"
            style={{
              background: "oklch(0.14 0.01 270)",
              border: "2px solid oklch(0.80 0.18 200)",
              color: "oklch(0.97 0.01 90)",
            }}
          />
          <button
            type="button"
            data-ocid="game.submit_button"
            onClick={handleSubmit}
            disabled={!name.trim() || submitMutation.isPending}
            className="w-full font-display font-black text-xl py-4 rounded-2xl transition-all duration-100 active:scale-95 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "oklch(0.80 0.18 200)",
              color: "oklch(0.1 0.005 270)",
              boxShadow: "0 4px 0 oklch(0.55 0.15 200)",
            }}
          >
            {submitMutation.isPending ? "SUBMITTING..." : "🏆 SUBMIT SCORE"}
          </button>
          {submitMutation.isError && (
            <div
              className="font-display font-black text-sm text-center"
              style={{ color: "oklch(0.65 0.25 25)" }}
            >
              😱 FAILED TO SUBMIT! TRY AGAIN
            </div>
          )}
        </div>
      ) : (
        <div
          className="w-full max-w-sm text-center rounded-2xl p-4 animate-fade-in-up"
          style={{
            background: "oklch(0.78 0.22 142 / 15%)",
            border: "2px solid oklch(0.78 0.22 142)",
          }}
        >
          <div
            className="font-display font-black text-2xl"
            style={{ color: "oklch(0.78 0.22 142)" }}
          >
            ✅ SCORE SAVED!
          </div>
          {rank !== null && (
            <div
              className="font-display font-black text-base mt-1"
              style={{ color: "oklch(0.92 0.22 95)" }}
            >
              YOU ARE RANK #{rank.toString()}!
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          type="button"
          data-ocid="game.play_again_button"
          onClick={onPlayAgain}
          className="flex-1 font-display font-black text-lg py-4 rounded-2xl transition-all duration-100 active:scale-95 hover:scale-105"
          style={{
            background: "oklch(0.92 0.22 95)",
            color: "oklch(0.1 0.005 270)",
            boxShadow: "0 4px 0 oklch(0.65 0.18 80)",
          }}
        >
          🔄 PLAY AGAIN
        </button>
        <button
          type="button"
          data-ocid="game.leaderboard_button"
          onClick={onLeaderboard}
          className="flex-1 font-display font-black text-lg py-4 rounded-2xl transition-all duration-100 active:scale-95 hover:scale-105 border-2"
          style={{
            background: "transparent",
            color: "oklch(0.80 0.18 200)",
            borderColor: "oklch(0.80 0.18 200)",
          }}
        >
          🏆 SCORES
        </button>
      </div>
    </div>
  );
}

// ─── LeaderboardScreen ─────────────────────────────────────────────────────

function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const { actor, isFetching } = useActor();

  const {
    data: entries,
    isLoading,
    isError,
  } = useQuery<ScoreEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getLeaderboard();
      return data.slice(0, 10);
    },
    enabled: !!actor && !isFetching,
  });

  const rankEmoji = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  const ocids = [
    "leaderboard.item.1",
    "leaderboard.item.2",
    "leaderboard.item.3",
    "leaderboard.item.4",
    "leaderboard.item.5",
    "leaderboard.item.6",
    "leaderboard.item.7",
    "leaderboard.item.8",
    "leaderboard.item.9",
    "leaderboard.item.10",
  ];

  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Header */}
      <div className="text-center mb-4 animate-fade-in-up">
        <div
          className="font-display font-black"
          style={{
            fontSize: "clamp(2rem, 8vw, 2.5rem)",
            color: "oklch(0.92 0.22 95)",
            textShadow: "3px 3px 0 rgba(0,0,0,0.6)",
          }}
        >
          🏆 LEADERBOARD
        </div>
        <div
          className="font-display font-black text-sm mt-1"
          style={{ color: "oklch(0.65 0.22 300)" }}
        >
          TOP TUNG MASTERS
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" data-ocid="leaderboard.table">
        {isLoading || isFetching ? (
          <div
            className="font-display font-black text-center text-xl py-8 animate-bot-bob"
            style={{ color: "oklch(0.65 0.22 300)" }}
          >
            🤖 LOADING...
          </div>
        ) : isError ? (
          <div
            className="font-display font-black text-center text-lg py-8"
            style={{ color: "oklch(0.65 0.25 25)" }}
          >
            😱 FAILED TO LOAD SCORES
          </div>
        ) : !entries || entries.length === 0 ? (
          <div
            className="font-display font-black text-center text-base py-8"
            style={{ color: "oklch(0.5 0.03 270)" }}
          >
            NO SCORES YET!
            <br />
            BE THE FIRST TUNG MASTER! 🥁
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div
                key={`lb-${entry.name}-${i}`}
                data-ocid={ocids[i]}
                className="flex items-center gap-3 rounded-xl px-4 py-3 animate-fade-in-up"
                style={{
                  background:
                    i < 3 ? "oklch(0.14 0.01 270)" : "oklch(0.13 0.008 270)",
                  border:
                    i === 0
                      ? "2px solid oklch(0.92 0.22 95)"
                      : i === 1
                        ? "2px solid oklch(0.78 0.05 270)"
                        : i === 2
                          ? "2px solid oklch(0.65 0.15 60)"
                          : "2px solid transparent",
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <span
                  className="font-display font-black text-xl w-8 text-center"
                  style={{
                    color:
                      i === 0
                        ? "oklch(0.92 0.22 95)"
                        : i === 1
                          ? "oklch(0.82 0.03 270)"
                          : i === 2
                            ? "oklch(0.75 0.15 60)"
                            : "oklch(0.5 0.03 270)",
                  }}
                >
                  {rankEmoji(i)}
                </span>
                <span
                  className="font-display font-black text-base flex-1 truncate"
                  style={{ color: "oklch(0.97 0.01 90)" }}
                >
                  {entry.name}
                </span>
                <span
                  className="font-display font-black text-xl"
                  style={{
                    color:
                      i === 0 ? "oklch(0.92 0.22 95)" : "oklch(0.75 0.22 40)",
                  }}
                >
                  {entry.score.toString()}
                </span>
                <span className="text-lg">🥁</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back */}
      <button
        type="button"
        data-ocid="game.start_button"
        onClick={onBack}
        className="mt-4 w-full font-display font-black text-xl py-4 rounded-2xl transition-all duration-100 active:scale-95 hover:scale-105"
        style={{
          background: "oklch(0.92 0.22 95)",
          color: "oklch(0.1 0.005 270)",
          boxShadow: "0 4px 0 oklch(0.65 0.18 80)",
        }}
      >
        ← BACK TO MENU
      </button>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [finalPlayerScore, setFinalPlayerScore] = useState(0);
  const [finalBotChaos, setFinalBotChaos] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const handleGameOver = useCallback(
    (playerScore: number, botChaos: number) => {
      setFinalPlayerScore(playerScore);
      setFinalBotChaos(botChaos);
      setScreen("gameover");
    },
    [],
  );

  const handlePlayAgain = useCallback(() => {
    setGameKey((k) => k + 1);
    setScreen("game");
  }, []);

  return (
    <div
      className="relative w-full h-screen flex flex-col overflow-hidden font-display"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 25% 20%, oklch(0.18 0.04 270) 0%, oklch(0.1 0.005 270) 65%)",
        }}
      />

      {/* Screens */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {screen === "start" && (
          <StartScreen
            onStart={() => setScreen("game")}
            onLeaderboard={() => setScreen("leaderboard")}
          />
        )}
        {screen === "game" && (
          <GameScreen key={gameKey} onGameOver={handleGameOver} />
        )}
        {screen === "gameover" && (
          <GameOverScreen
            playerScore={finalPlayerScore}
            botChaos={finalBotChaos}
            onPlayAgain={handlePlayAgain}
            onLeaderboard={() => setScreen("leaderboard")}
          />
        )}
        {screen === "leaderboard" && (
          <LeaderboardScreen onBack={() => setScreen("start")} />
        )}
      </div>
    </div>
  );
}
