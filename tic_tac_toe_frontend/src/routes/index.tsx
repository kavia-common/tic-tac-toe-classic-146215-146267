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
            aria-label={`Cell ${i + 1}, ${cell ? cell : "empty"}`}
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
            <span class="cell__content">{cell ?? ""}</span>
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
            aria-label={`Current player ${currentPlayer}`}
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
            {currentPlayer}
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
    font-size: clamp(2.2rem, 7vw, 2.8rem);
    font-weight: 800;
    letter-spacing: .05em;
    cursor: pointer;
    color: ${cell === "X" ? "#1e40af" : cell === "O" ? "#92400e" : "var(--color-text)"};
    user-select: none;
  `;
  const hover = `
    will-change: transform;
  `;
  const disabled =
    cell !== null
      ? `
    cursor: default;
    transform: none !important;
  `
      : "";

  return base + hover + disabled;
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
