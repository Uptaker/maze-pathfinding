<script lang="ts">
  import {fade} from 'svelte/transition'
  import {onMount} from 'svelte'
  import type {Position, Tile} from '../types'
  import {Type} from '../types'
  import DijkstraSolver from "./DijkstraSolver.svelte";

  let startPosition: Position
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
  let state: Tile[][] = stringToTile(stateAsStrings)

  let timer = new AbortController()
  let delay = 20
  let debugMode = false
  let mouseDown = false
  let message = ''

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
      case Type.GRAY:
        return '#ecdb6c'
      case Type.BLACK:
        return 'yellow'
      case Type.START:
        return 'cyan'
      case Type.FINISH:
        return 'forestgreen'
      case Type.OBSTACLE:
        return '#5f1602'
      default:
        return '#f1d2d0'
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

  function reset() {
    timer.abort()
    timer = new AbortController()
    state = stringToTile(stateAsStrings)
    message = ''
  }

  onMount(() => console.log(state))

</script>

<h2>{message}</h2>

<div class="board" style="margin-bottom: 5px" on:mousedown={() => mouseDown = true} on:mouseup={() => mouseDown = false} on:mouseleave={() => mouseDown = false}>
    {#if state}
        <div class="row">
            {#each state as row, i}
                <div class="column" >
                    {#each row as value, j}
                        <div transition:fade={{duration: 5000}} class="square" on:click={() => swapTile(value)} on:mouseenter={() => mouseEnter(value)}
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

<DijkstraSolver bind:state bind:message {timer} {delay} {startPosition} />
<button on:click={reset}>Reset</button>

<label for="debug">Debug mode</label>
<input type="checkbox" id="debug" bind:checked={debugMode}>

<label for="delay">Delay: {delay}ms</label>
<input type="range" min="0" max="200" step="20" id="delay" bind:value={delay}>

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