<script lang="ts">

  import {onMount} from 'svelte'

  enum Type {
    START = 'S', FINISH = 'F', WHITE = 'W', GRAY = 'G', BLACK = 'B', OBSTACLE = 'O', EMPTY = '.'
  }

  interface Tile {
    type: Type,
    x: number,
    y: number
  }

  const stateAsStrings: string[] = [
    '.S...OOOOO......',
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

  const state: Tile[][] = stringToTile(stateAsStrings)

  onMount(() => console.log(state))

  function stringToTile(strings: string[]): Tile[][] {
    let startingState: Tile[][] = []
    strings.forEach((r, x) => {
      const row = []
      const column = r.split("")
      column.forEach((c, y) => row.push({type: c, x, y} as Tile))
      startingState.push(row)
    })
    return startingState
  }

  function color(value: Tile) {
    switch (value.type) {
      case Type.GRAY: return 'gray'
      case Type.WHITE: return 'white'
      case Type.BLACK: return 'black'
      case Type.START: return 'yellow'
      case Type.FINISH: return 'green'
      case Type.OBSTACLE: return 'peru'
      default: return 'moccasin'
    }
  }

  function swapTile(tile: Tile) {
    if (tile.type !== Type.EMPTY && tile.type !== Type.OBSTACLE) return
    state[tile.x][tile.y].type = tile.type === Type.OBSTACLE ? Type.EMPTY : Type.OBSTACLE
  }

</script>

<div class="board" style="margin-bottom: 5px">
    {#if state}
        <div class="row">
            {#each state as row, i}
                <div class="column">
                    {#each row as value, j}
                        <div class="square" on:click={() => swapTile(value)}
                             style="background-color: {color(value)}">
                            {#if value.type === Type.START || value.type === Type.FINISH}
                                <b>{value.type === Type.START ? 'Start' : 'Finish'}</b>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    {/if}
</div>

<button>Move</button>

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
        border: 1px solid sienna;
    }

    .board {
        width: min-content;
        margin: 0 auto;
    }
</style>