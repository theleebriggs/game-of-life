import { useReducer, useEffect } from 'react'

const Grid = ({ columns = 12, children }) => (
  <>
    <div
      className="Grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {children}
    </div>

    <style jsx>{`
      .Grid {
        display: grid;
        width: 100%;
      }
    `}</style>
  </>
)

const Cell = ({ alive = false, onClick = () => { } }) => (
  <>
    <button
      type="button"
      onClick={onClick}
      className={`Cell ${alive ? 'Cell--alive' : ''}`}
    >
    </button>
    <style jsx>{`
      .Cell {
        background: transparent;
        border: 1px solid #000;
        padding-bottom: 100%;
        transition: all .5s;
        outline: none;
      }

      .Cell:hover {
        background: rgba(0, 255, 0, .25);
      }

      .Cell--alive,
      .Cell--alive:hover {
        background: green;
      }
    `}</style>
  </>
)

type GameState = {
  cells: Array<boolean>,
  columns: number,
  generation: number,
  playing: boolean
}

type GameAction =
  | { type: 'TOGGLE_CELL', index: number }
  | { type: 'TOGGLE_PLAYING' }
  | { type: 'NEXT' }
  | { type: 'RESET' }

const getNeighboursCount = (index, columns, collection) => {
  const neighbours = [
    (index - columns) - 1, // Top Left
    index - columns, // Top
    (index - columns) + 1, // Top Right
    index + 1, // Right
    (index + columns) + 1, // Bottom Right
    index + columns, // Bottom
    (index + columns) - 1, // Bottom Left
    index - 1 // Left
  ];

  return collection.filter((c, i) => neighbours.indexOf(i) > -1 && c).length;
}

const gameReducer = (state: GameState, action: GameAction) => {
  switch (action.type) {
    case 'TOGGLE_CELL': {
      const cells = [...state.cells];
      cells[action.index] = !cells[action.index]
      return {
        ...state,
        cells
      }
    }
    case 'NEXT': {
      const cells = state.cells
        .map((c, i) => {
          const neighbours = getNeighboursCount(i, state.columns, state.cells);
          if (c && neighbours > 1 && neighbours < 4) return true;
          if (!c && neighbours === 3) return true;
          if (c) return false;
          return false;
        })
      return {
        ...state,
        generation: state.generation + 1,
        cells
      };
    }
    case 'TOGGLE_PLAYING': {
      return {
        ...state,
        playing: !state.playing
      }
    }
    case 'RESET': {
      return getInitialState(state.cells.length, state.columns)
    }
    default: {
      return state
    }
  }
}

const getInitialState = (numberOfCells, columns) => ({
  cells: (new Array(numberOfCells)).fill(false),
  columns,
  generation: 0,
  playing: false
})

export default function Game({ dimensions = [10, 8] }) {
  let interval = null;
  const [columns, rows] = dimensions;
  const [state, dispatch] = useReducer(gameReducer, getInitialState(columns * rows, columns))

  const next = () => {
    dispatch({ type: 'NEXT' })
    dispatch({ type: 'TOGGLE_CELL', index: 0 })
  }

  useEffect(() => {
    if (state.playing) {
      interval = setInterval(() => next(), 1000);
    }

    if (!state.playing && interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [state.playing])

  return (
    <>
      <div
        className="controls"
      >
        <h2>Generation: {state.generation}</h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_PLAYING' })}>
          {state.playing ? 'Stop' : 'Start'}
        </button>
        <button onClick={() => dispatch({ type: 'RESET' })}>
          Reset
        </button>
      </div>
      <Grid
        columns={columns}
      >
        {
          state.cells.map((c, i) => (
            <Cell
              key={i}
              alive={c}
              onClick={() => dispatch({ type: 'TOGGLE_CELL', index: i })}
            />
          ))
        }
      </Grid>
      <style jsx>{`
        .controls {
          display: flex;
          padding: .5rem;
          border: 1px solid #000;
          border-bottom-width: 0;
          width: 100%;
        }

        .controls > * {
          font-size: 1.15rem;
          line-height: 100%;
        }

        .controls > :first-child {
          margin-right: auto;
        }

        button {
          padding: 0 .75rem;
          margin-left: .5rem;
        }
      `}</style>
    </>
  )
}