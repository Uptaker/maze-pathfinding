<script lang="ts">
  import {fade} from 'svelte/transition'
  import {onMount} from 'svelte'
  import type {Position, Tile} from './types'
  import {Type} from './types'
  import {logTilesToStrings} from "./utils";
  import {mazes} from './mazes'
  import BFSLargestIndex from "./solvers/BFSLargestIndex.svelte";
  import BFSNearestNeighbor from "./solvers/BFSNearestNeighbor.svelte";
  import BFSSolver from "./solvers/BFSSolver.svelte";
  import DFSSolver from "./solvers/DFSSolver.svelte";

  let startPosition: Position
  let finishPosition: Position

  let state: Tile[][] = stringToTile(mazes.empty)

  let statePicker = Type | undefined
  let timer = new AbortController()
  let delay = 20
  let debugMode = false
  let mouseDown = false
  let message = ''
  let loading = false

  function stringToTile(strings: string[]): Tile[][] {
    let startingState: Tile[][] = []
    strings.forEach((r, x) => {
      const row = []
      const column = r.split("")
      column.forEach((c, y) => {
        row.push({type: c, x, y} as Tile)
        if (c === Type.START) startPosition = {x, y}
        if (c === Type.FINISH) finishPosition = {x, y}
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
        return 'lawngreen'
      case Type.OBSTACLE:
        return '#5f1602'
      default:
        return '#f1d2d0'
    }
  }

  function clearTiles() {
    state.forEach(row => row.forEach(tile => {
      if (tile.type === Type.BLACK || tile.type === Type.GRAY || tile.type === Type.EMPTY) {
        tile.type = Type.EMPTY
        tile.direction = null
      }
    }))
    state = state
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
    loading = false
    timer = new AbortController()
    clearTiles()
    message = ''
  }

  function pickState(pos: Position) {
    if (statePicker === Type.FINISH) {
      state[finishPosition.x][finishPosition.y].type = Type.EMPTY
      state[pos.x][pos.y].type = Type.FINISH
      finishPosition = pos
    }

    if (statePicker === Type.START) {
      state[startPosition.x][startPosition.y].type = Type.EMPTY
      state[pos.x][pos.y].type = Type.START
      startPosition = pos
    }

    statePicker = null
  }

  function selectMaze(name: string) {
    reset()
    state = stringToTile(mazes[name])
  }

  onMount(() => console.log(state))

</script>

<h2>{message}&nbsp;</h2>

<div class="fluid-container">
    <div class="board" style="margin-bottom: 5px" on:mousedown={() => mouseDown = true} on:mouseup={() => mouseDown = false} on:mouseleave={() => mouseDown = false}>
        {#if state}
            <div class="row">
                {#each state as row, x}
                    <div class="column" >
                        {#each row as value, y}
                            <div transition:fade={{duration: 5000}} class="square" on:click={() => statePicker ? pickState({x, y}) : swapTile(value)} on:mouseenter={() => mouseEnter(value)}
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

    <div class="fluid-controls">
        <div class="row gap">
            <h3>Other</h3>
            <label for="delay">Delay: {delay}ms</label>
            <input type="range" min="0" max="200" step="20" id="delay" bind:value={delay}>
            <button on:click={ () => logTilesToStrings(state)}>Log map to console</button>
            <div>
                <label for="debug">Debug mode</label>
                <input type="checkbox" id="debug" bind:checked={debugMode}>
            </div>

        </div>

        <div class="row gap">
            <h3>Controls</h3>
            <BFSSolver bind:state bind:message {timer} {delay} {startPosition} bind:loading />
            <BFSLargestIndex bind:state bind:message {timer} {delay} {startPosition} bind:loading />
            <BFSNearestNeighbor bind:state bind:message {timer} {delay} {startPosition} {finishPosition} bind:loading />
            <DFSSolver bind:state bind:message {timer} {delay} {startPosition} bind:loading />
            <button style="background-color: lightblue; margin-top: 30px" on:click={reset}>Reset ↻</button>

            <div class="column gap justify-between">
                <button on:click={() => statePicker = Type.START} style="background-color: cyan; width: 100%">Pick start</button>
                <button on:click={() => statePicker = Type.FINISH} style="background-color: lawngreen; width: 100%">Pick end</button>
            </div>
        </div>

        <div class="row gap">
            <h3>Pre-made maps</h3>
            <button on:click={() => selectMaze("maze")}>Maze</button>
            <button on:click={() => selectMaze("spiral")}>Spiral</button>
            <button on:click={() => selectMaze("long")}>Long</button>
            <button on:click={() => selectMaze("zigzag")}>Zig-zag</button>
            <button on:click={() => selectMaze("chaos")}>C̪̼̑͗͞Ĥ̥͇ͤAO͆̓͊S̪͇͐͆͜</button>
            <button on:click={() => selectMaze("empty")}>Empty</button>
            <button on:click={() => selectMaze("edgeToEdge")}>Empty, edge to edge</button>
        </div>
    </div>
</div>

<style>
    .row {
        display: flex;
        flex-direction: column;
    }

    .gap {
        gap: 5px;
    }

    .justify-between {
        justify-content: space-between;
    }

    .column {
        display: flex;
    }

    .square {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #521001;
        font-size: 11px;
    }

    .square:hover {
        filter: brightness(120%);
        transform: scale(1.3);
        transition: 0.15s all;
    }

    .board {
        width: min-content;
        margin: 0 auto;
    }

    .fluid-container {
        display: flex;
        width: 100%;
        gap: 40px;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
    }

    .fluid-controls {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 15px;
    }

    @media only screen and (min-width: 1180px) {
        .fluid-container {
            flex-direction: row;
        }
        .fluid-controls {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
        }
    }
</style>