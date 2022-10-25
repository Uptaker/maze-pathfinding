<script lang="ts">
  import type {Position, Tile} from '../types'
  import {Direction, Type} from '../types'
  import {sleep} from '../utils'

  export let startPosition: Position
  export let state: Tile[][]
  export let delay: number
  export let timer: AbortController
  export let message: string
  export let loading: boolean

  async function solve() {
    loading = true
    let queue = [{x: startPosition.x, y: startPosition.y}] as Position[]
    let pathFound = false
    let pos: Position

    while (queue.length > 0 && !pathFound) {
      let index = findBiggestIndex(queue)
      pos = queue[index]
      queue.splice(index, 1)

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
      if (delay !== 0) await sleep(delay, timer.signal)
    }

    if (!pathFound) message = 'No path found 😣'
    else {
      message = 'Path found 💯🔥'
      let xLoc = pos.x
      let yLoc = pos.y
      let path = state[xLoc][yLoc].direction
      while (state[xLoc][yLoc].type !== Type.START) {
        state[xLoc][yLoc].type = Type.BLACK
        if (path === Direction.UP) xLoc -= 1
        if (path === Direction.DOWN) xLoc += 1
        if (path === Direction.RIGHT) yLoc += 1
        if (path === Direction.LEFT) yLoc -= 1
        path = state[xLoc][yLoc].direction
      }
    }
    loading = false
  }

  function findBiggestIndex(queue: Position[]) {
    let biggestIndex = 0;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].x + queue[i].y > queue[biggestIndex].x + queue[biggestIndex].y) biggestIndex = i
    }
    return biggestIndex
  }
</script>

<button on:click={solve} disabled={loading}>Semi-Optimized</button>