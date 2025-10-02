import {
  $,
  component$,
  useComputed$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

/**
 * Game types and helpers
 */
type Player = "X" | "O";
type Board = (Player | null)[];

/** Simple inlined, theme-aware SVG icons for players */
// PUBLIC_INTERFACE
export const KnightIcon = component$<{ title?: string; color?: string }>(
  ({ title = "Knight", color = "#1e40af" }) => (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      width="80%"
      height="80%"
      style="display:block"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="k-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(37,99,235,0.25)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.9)" />
        </linearGradient>
      </defs>
      <g fill={color} stroke={color} stroke-width="1.5">
        <path
          fill="url(#k-body)"
          d="M20 50h22c1.7 0 3 1.3 3 3v4H17v-4c0-1.7 1.3-3 3-3z"
          opacity="0.85"
        />
        <path
          d="M42 44c0 2-2 4-4 4H22c-2.2 0-4-1.8-4-4 0-1.4.8-2.7 2-3.4 2.5-1.4 4.1-2.6 5.1-5.7l2.1-6.4-3.3-2.7c-1.1-.9-1.5-2.4-.9-3.7l2.1-4.3c.6-1.3 1.9-2.1 3.4-2 2.1.1 4.6.9 7.7 2.6 1.6.9 2.9 2.1 3.8 3.7 1 1.8 1.9 4.1 1.9 6.1 0 2.8-1.3 4.9-3.1 6.4 1.6 1.2 2.1 3 2.1 5z"
          fill={color}
          opacity="0.95"
        />
        <circle cx="33" cy="25" r="1.6" fill="#0b1324" />
      </g>
    </svg>
  ),
);

// PUBLIC_INTERFACE
export const QueenIcon = component$<{ title?: string; color?: string }>(
  ({ title = "Queen", color = "#7c2d12" }) => (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      width="82%"
      height="82%"
      style="display:block"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="q-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(245,158,11,0.28)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.92)" />
        </linearGradient>
      </defs>
      <g fill={color} stroke={color} stroke-width="1.5">
        <path
          d="M20 50h24c1.7 0 3 1.3 3 3v4H17v-4c0-1.7 1.3-3 3-3z"
          fill="url(#q-body)"
          opacity="0.85"
        />
        <path
          d="M32 18l5 7 7-5-2 11 6 4-11 2-5 10-5-10-11-2 6-4-2-11 7 5 5-7z"
          fill={color}
          opacity="0.95"
        />
        <circle cx="32" cy="16" r="2.2" fill={color} />
      </g>
    </svg>
  ),
);

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

function checkWinner(board: Board): Player | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isBoardFull(board: Board) {
  return board.every((c) => c !== null);
}

// PUBLIC_INTERFACE
export default component$(() => {
  // State signals
  const boardSig = useSignal<Board>(Array(9).fill(null));
  const xIsNext = useSignal<boolean>(true);
  const gameOver = useSignal<boolean>(false);
  const winnerSig = useSignal<Player | null>(null);

  // Derived state
  const currentPlayer = useComputed$<Player>(() => (xIsNext.value ? "X" : "O"));
  const statusText = useComputed$(() => {
    if (winnerSig.value) return `Player ${winnerSig.value} wins!`;
    if (gameOver.value) return "It's a draw!";
    return `Turn: Player ${currentPlayer.value}`;
  });

  useTask$(({ track }) => {
    track(() => boardSig.value);
    const w = checkWinner(boardSig.value);
    if (w) {
      winnerSig.value = w;
      gameOver.value = true;
    } else if (isBoardFull(boardSig.value)) {
      gameOver.value = true;
    } else {
      gameOver.value = false;
      winnerSig.value = null;
    }
  });

  const handleCellClick = $((index: number) => {
    if (gameOver.value) return;
    const board = boardSig.value.slice();
    if (board[index]) return;
    board[index] = currentPlayer.value;
    boardSig.value = board;
    xIsNext.value = !xIsNext.value;
  });

  const handleRestart = $(() => {
    boardSig.value = Array(9).fill(null);
    xIsNext.value = true;
    gameOver.value = false;
    winnerSig.value = null;
  });

  const randomFirst = $(() => {
    xIsNext.value = Math.random() > 0.5;
    handleRestart();
  });

  return (
    <div class="app-shell">
      <header class="app-header container">
        <div class="brand" aria-label="Tic Tac Toe">
          <div class="brand__logo" aria-hidden="true" />
          <div>
            <div class="brand__title">Tic Tac Toe</div>
            <div style="font-size:.9rem;color:var(--color-muted)">
              Ocean Professional
            </div>
          </div>
        </div>
      </header>

      <main class="app-main">
        <section
          class="card-surface fade-in"
          style="
            padding:1.25rem;
            width: min(520px, 92vw);
          "
          aria-labelledby="game-title"
        >
          <h1 id="game-title" class="visually-hidden">
            Tic Tac Toe Game
          </h1>

          <GameStatus
            status={statusText.value}
            currentPlayer={currentPlayer.value}
            gameOver={gameOver.value}
          />

          <GameBoard
            board={boardSig.value}
            onCellClick$={$((i: number) => handleCellClick(i))}
            winner={winnerSig.value}
            gameOver={gameOver.value}
          />

          <Controls
            onRestart$={$(() => handleRestart())}
            onNewGame$={$(() => randomFirst())}
            gameOver={gameOver.value}
          />
        </section>
      </main>

      <footer class="app-footer">
        <span>
          Built with Qwik • Accessible • No backend • Smooth transitions
        </span>
      </footer>
    </div>
  );
});

/**
 * Board component
 */
interface GameBoardProps {
  board: Board;
  winner: Player | null;
  gameOver: boolean;
  onCellClick$: import("@builder.io/qwik").QRL<(index: number) => void>;
}

// PUBLIC_INTERFACE
export const GameBoard = component$<GameBoardProps>(
  ({ board, onCellClick$, winner, gameOver }) => {
    const announce = winner
      ? `Player ${winner} wins`
      : gameOver
      ? "Game ended in a draw"
      : "";

    return (
      <div
        class="board"
        role="grid"
        aria-label="Tic Tac Toe Board"
        aria-live="polite"
        aria-atomic="true"
        style="
          margin: 1rem auto 1.25rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: min(420px, 86vw);
        "
      >
        <span class="visually-hidden" aria-live="polite">
          {announce}
        </span>
        {board.map((cell, i) => (
          <button
            key={i}
            role="gridcell"
            aria-label={`Cell ${i + 1}, ${
              cell === "X" ? "Knight" : cell === "O" ? "Queen" : "empty"
            }`}
            class={[
              "cell",
              cell === "X" ? "cell--x" : "",
              cell === "O" ? "cell--o" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={Boolean(cell) || gameOver}
            onClick$={() => onCellClick$(i)}
            style={cellButtonStyle(cell)}
          >
            <span class="cell__content" aria-hidden={cell ? "false" : "true"}>
              {cell === "X" ? (
                <KnightIcon
                  title="Knight"
                  color="#1e3a8a"
                />
              ) : cell === "O" ? (
                <QueenIcon title="Queen" color="#7c2d12" />
              ) : (
                ""
              )}
            </span>
          </button>
        ))}
      </div>
    );
  },
);

/**
 * Status component
 */
interface GameStatusProps {
  status: string;
  currentPlayer: Player;
  gameOver: boolean;
}

// PUBLIC_INTERFACE
export const GameStatus = component$<GameStatusProps>(
  ({ status, currentPlayer, gameOver }) => {
    return (
      <div
        class="status card-surface"
        style="
          padding:.85rem 1rem;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:.75rem;
          margin-bottom: .75rem;
          border-radius: 12px;
        "
        aria-live="polite"
      >
        <div
          style="display:flex;align-items:center;gap:.75rem;min-width:0;"
          title={status}
        >
          <StatusDot
            color={gameOver ? "muted" : currentPlayer === "X" ? "blue" : "amber"}
          />
          <div
            style="
              font-weight: 700;
              letter-spacing:.2px;
              color: var(--color-text);
              overflow:hidden;
              text-overflow:ellipsis;
              white-space:nowrap;
            "
          >
            {status}
          </div>
        </div>
        {!gameOver && (
          <div
            class="turn-pill"
            style={`
              display:inline-flex;align-items:center;gap:.5rem;
              background: ${
                currentPlayer === "X"
                  ? "rgba(37,99,235,.08)"
                  : "rgba(245,158,11,.12)"
              };
              color: ${currentPlayer === "X" ? "#1e3a8a" : "#7c2d12"};
              padding:.5rem .75rem;border-radius:999px;
              font-weight: 700;
              box-shadow: var(--shadow-sm);
              border: 1px solid rgba(17,24,39,0.06);
            `}
            aria-label={`Current player ${currentPlayer === "X" ? "Knight" : "Queen"}`}
            title={`Current player: ${currentPlayer === "X" ? "Knight" : "Queen"}`}
          >
            <span
              style={`
                width:10px;height:10px;border-radius:999px;
                background: ${
                  currentPlayer === "X" ? "var(--color-primary)" : "var(--color-accent)"
                };
                box-shadow: 0 0 0 3px ${
                  currentPlayer === "X"
                    ? "rgba(37,99,235,0.15)"
                    : "rgba(245,158,11,0.2)"
                };
              `}
              aria-hidden="true"
            />
            {/* Replace letter with tiny icon for consistency */}
            <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;">
              {currentPlayer === "X" ? (
                <KnightIcon title="Knight" color="#1e3a8a" />
              ) : (
                <QueenIcon title="Queen" color="#7c2d12" />
              )}
            </span>
          </div>
        )}
      </div>
    );
  },
);

// PUBLIC_INTERFACE
export const StatusDot = component$<{ color: "blue" | "amber" | "muted" }>(
  ({ color }) => {
    const bg =
      color === "muted"
        ? "rgba(17,24,39,.16)"
        : color === "blue"
        ? "var(--color-primary)"
        : "var(--color-accent)";
    const ring =
      color === "muted"
        ? "rgba(17,24,39,.08)"
        : color === "blue"
        ? "rgba(37,99,235,.25)"
        : "rgba(245,158,11,.25)";
    return (
      <span
        aria-hidden="true"
        style={`
          width:12px;height:12px;border-radius:999px;
          background:${bg};
          box-shadow: 0 0 0 4px ${ring};
          display:inline-block;
        `}
      />
    );
  },
);

/**
 * Controls component
 */
interface ControlsProps {
  onRestart$: import("@builder.io/qwik").QRL<() => void>;
  onNewGame$: import("@builder.io/qwik").QRL<() => void>;
  gameOver: boolean;
}

// PUBLIC_INTERFACE
export const Controls = component$<ControlsProps>(
  ({ onRestart$, onNewGame$, gameOver }) => {
    return (
      <div
        class="controls"
        style="
          display:flex;
          flex-wrap: wrap;
          gap:.75rem;
          justify-content: center;
          margin-top:.5rem;
        "
      >
        <button
          type="button"
          class="btn btn-primary"
          onClick$={onRestart$}
          aria-label="Restart current round"
        >
          Restart
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          onClick$={onNewGame$}
          aria-label="New game with random first player"
        >
          New Game
        </button>
        {gameOver && (
          <span
            style="
              align-self:center;
              color: var(--color-muted);
              font-weight:600;
            "
            aria-live="polite"
          >
            Game over
          </span>
        )}
      </div>
    );
  },
);

/**
 * Style helpers
 */
function cellButtonStyle(cell: Player | null): string {
  const base = `
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 18px;
    border: 1px solid rgba(17,24,39,0.08);
    background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.92));
    box-shadow: var(--shadow-md);
    transition: transform var(--transition), box-shadow var(--transition), background var(--transition), border-color var(--transition), color var(--transition);
    display: grid; place-items: center;
    cursor: pointer;
    user-select: none;
    /* icon container sizing */
    padding: 6%;
  `;
  const disabled =
    cell !== null
      ? `
    cursor: default;
    transform: none !important;
  `
      : "";

  return base + disabled;
}

export const head: DocumentHead = {
  title: "Tic Tac Toe • Ocean Professional",
  meta: [
    {
      name: "description",
      content:
        "A modern, accessible Tic Tac Toe game built with Qwik. Smooth transitions, responsive, Ocean Professional theme.",
    },
    {
      name: "theme-color",
      content: "#2563EB",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1, viewport-fit=cover",
    },
  ],
};
