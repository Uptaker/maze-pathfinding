<script lang="ts">
  import {fade} from 'svelte/transition'
  import {onMount} from 'svelte'
  import type {Position, Tile} from '../types'
  import {Direction, Type} from '../types'

  let debugMode = false
  let mouseDown = false
  let message = ''
  const stateAsStrings: string[] = [
    'S....OOOOO......',
    '...OOOO.F..OOOO.',
    '....OO.OOOOO....',
    '.........O.O.O..',
    'O...O..OOO...O..',
    'OOO.O....OOOOOO.',
    'O...O.......O...',
    'O...O...O...O...',
    'O.......O...O...',
    'O.......O...O...',
    'OOO.....O.......'
  ]

  let startPosition: Position
  let state: Tile[][] = stringToTile(stateAsStrings)

  onMount(() => console.log(state))

  let timer = new AbortController()

  function stringToTile(strings: string[]): Tile[][] {
    let startingState: Tile[][] = []
    strings.forEach((r, x) => {
      const row = []
      const column = r.split("")
      column.forEach((c, y) => {
        row.push({type: c, x, y} as Tile)
        if (c === Type.START) startPosition = {x, y}
      })
      startingState.push(row)
    })
    return startingState
  }

  function color(value: Tile) {
    switch (value.type) {
      case Type.GRAY: return '#ecdb6c'
      case Type.BLACK: return 'yellow'
      case Type.START: return 'cyan'
      case Type.FINISH: return 'forestgreen'
      case Type.OBSTACLE: return '#5f1602'
      default: return '#f1d2d0'
    }
  }

  function swapTile(tile: Tile) {
    if (tile.type !== Type.EMPTY && tile.type !== Type.OBSTACLE) return
    state[tile.x][tile.y].type = tile.type === Type.OBSTACLE ? Type.EMPTY : Type.OBSTACLE
  }

  function mouseEnter(tile: Tile) {
    if (!mouseDown) return
    swapTile(tile)
  }

  function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve()
        signal.removeEventListener('abort', abort)
      }, ms)
      const abort = () => {
        clearTimeout(timeout)
        reject(new Error('Cancelled'))
      }
      if (signal.aborted) abort();
      else signal.addEventListener('abort', abort)
    });
  }

  async function solve() {
    let queue = [{x: startPosition.x, y: startPosition.y}] as Position[]
    let pathFound = false
    let pos: Position

    while (queue.length > 0 && !pathFound) {
        pos = queue.shift()

        if (pos.x > 0) {
          if (state[pos.x - 1][pos.y].type === Type.FINISH) pathFound = true
          else if (state[pos.x - 1][pos.y].type === Type.EMPTY) {
            queue.push({x: pos.x - 1, y: pos.y})
            state[pos.x - 1][pos.y].direction = Direction.DOWN
            state[pos.x - 1][pos.y].type = Type.GRAY
          }
        }
        if (pos.x < state.length - 1) {
          if (state[pos.x + 1][pos.y].type === Type.FINISH) pathFound = true
          else if (state[pos.x + 1][pos.y].type === Type.EMPTY) {
            queue.push({x: pos.x + 1, y: pos.y})
            state[pos.x + 1][pos.y].direction = Direction.UP
            state[pos.x + 1][pos.y].type = Type.GRAY
          }
        }
        if (pos.y > 0) {
          if (state[pos.x][pos.y - 1].type === Type.FINISH) pathFound = true
          else if (state[pos.x][pos.y - 1].type === Type.EMPTY) {
            queue.push({x: pos.x, y: pos.y - 1})
            state[pos.x][pos.y - 1].direction = Direction.RIGHT
            state[pos.x][pos.y - 1].type = Type.GRAY
          }
        }
        if (pos.y < state[0].length - 1) {
          if (state[pos.x][pos.y + 1].type === Type.FINISH) pathFound = true
          else if (state[pos.x][pos.y + 1].type === Type.EMPTY) {
            queue.push({x: pos.x, y: pos.y + 1})
            state[pos.x][pos.y + 1].direction = Direction.LEFT
            state[pos.x][pos.y + 1].type = Type.GRAY
          }
        }
      await sleep(20, timer.signal)
    }

    if (!pathFound) message = 'No path found :('
    else {
      message = 'Path found'
      let xLoc = pos.x
      let yLoc = pos.y
      let path = state[xLoc][yLoc].direction
      while (state[xLoc][yLoc].type !== Type.START) {
        state[xLoc][yLoc].type = Type.BLACK
        if (path === Direction.UP) xLoc -= 1
        if (path === Direction.DOWN) xLoc += 1
        if (path === Direction.RIGHT) yLoc += 1
        if (path === Direction.LEFT) yLoc -= 1
        console.log(state[xLoc][yLoc])
        path = state[xLoc][yLoc].direction
      }
    }
  }

  function reset() {
    timer.abort()
    timer = new AbortController()
    state = stringToTile(stateAsStrings)
  }

</script>

<div class="board" style="margin-bottom: 5px" on:mousedown={() => mouseDown = true} on:mouseup={() => mouseDown = false} on:mouseleave={() => mouseDown = false}>
    {#if state}
        <div class="row">
            {#each state as row, i}
                <div class="column" >
                    {#each row as value, j}
                        <div transition:fade={{duration: 500, delay: 500}} class="square" on:click={() => swapTile(value)} on:mouseenter={() => mouseEnter(value)}
                             style="background-color: {color(value)}">
                            {#if value.type === Type.START || value.type === Type.FINISH}
                                <b>{value.type === Type.START ? 'Start' : 'Finish'}</b>
                            {/if}
                            {#if debugMode}
                                {#if value.direction}<b>{value.direction}</b>{/if}
                                <span>x: {value.x}</span>
                                <span>y: {value.y}</span>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    {/if}
</div>

<div>{message}</div>

<button on:click={solve}>Solve</button>
<button on:click={reset}>Reset</button>

<label for="debug">Debug mode</label>
<input type="checkbox" id="debug" bind:checked={debugMode}>

<style>
    .row {
        display: flex;
        flex-direction: column;
    }

    .column {
        display: flex;
    }

    .square {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #521001;
    }

    .board {
        width: min-content;
        margin: 0 auto;
    }
</style>