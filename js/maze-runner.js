const RUNNER = '$';
const WALL   = '@';

let isGoalState = (state) => {
  let map = state.map;
  return map[map.length - 1].includes(RUNNER);
};

let findPlayer = (map) => {
  let row = map.findIndex( e => e.includes(RUNNER) );
  let col = map[row].indexOf(RUNNER);

  return [row, col];
};

let move = (map, from, to) => {
  [frow,fcol] = from;
  [trow,tcol] = to;

  let mapCopy = JSON.parse( JSON.stringify(map) );
  mapCopy[frow][fcol] = ' ';
  mapCopy[trow][tcol] = RUNNER;

  return mapCopy;
};

let successors = (state) => {
  let map = state.map;
  let [prow, pcol] = findPlayer(state.map);
  let results = [];

  if(state.previousMove != 'UP' && map[prow+1][pcol] == ' ')
    results.unshift({ map: move(map, [prow,pcol], [prow+1,pcol]), previousMove: 'DOWN' })

  if(state.previousMove != 'LEFT' && map[prow][pcol+1] == ' ')
    results.unshift({ map: move(map, [prow,pcol], [prow,pcol+1]), previousMove: 'RIGHT' })

  if(state.previousMove != 'RIGHT' && map[prow][pcol-1] == ' ')
    results.unshift({ map: move(map, [prow,pcol], [prow,pcol-1]), previousMove: 'LEFT' })

  if(state.previousMove != 'DOWN' && map[prow-1][pcol] == ' ')
    results.unshift({ map: move(map, [prow,pcol], [prow-1,pcol]), previousMove: 'UP' })

  return results;
};

let mapToString = (map) => {
  return map.map( row => row.join('') ).join("\n");
};

let dfs = (frontier) => {
  let visited = [];

  let loop = () => {
    let node = frontier.pop();
    if(!node) return;

    let strMap = mapToString(node.map);
    if(visited.includes(strMap)) {
      loop();
      return;
    }

    walkMapHTML(node.map);
    visited.push(strMap);

    if(isGoalState(node)) {
      return;
    } else {
      frontier = frontier.concat(successors(node));
      setTimeout(loop, 100);
    }
  };

  loop();

};

let bfs = (frontier) => {
  let visited = [];

  let loop = () => {
    let node = frontier.shift();
    if(!node) return;

    let strMap = mapToString(node.map);
    if(visited.includes(strMap)) {
      loop();
      return;
    }

    walkMapHTML(node.map);
    visited.push(strMap);

    if(isGoalState(node)) {
      return;
    } else {
      frontier = frontier.concat(successors(node));
      setTimeout(loop, 100);
    }
  };

  loop();

};


// View Code

let generateMapHTML = (map) => {
  let rows = map.map((row,i) => {
    let cols = row.map((col,j) => {
      return `<div id="r${i}c${j}" class="col ${ col == WALL ? 'wall' : '' }"></div>`;
    }).join('');

    return `<div class="row">${cols}</div>`;
  }).join('');

  $('.map').html(rows);
};

let walkMapHTML = (map) => {
  let [prow, pcol] = findPlayer(map);
  $(`#r${prow}c${pcol}`).addClass('walked');
};

let generateRandomMaze = (options) => {
  let mazeMap = amaze(options);
  let entryColumnIndex = mazeMap[0].indexOf(' ');
  mazeMap[0][entryColumnIndex] = RUNNER;

  mazeMap.pop(); // Amaze adds an empty row as the last row. We dont need it.
  return mazeMap;
};

let MAP = generateRandomMaze({ rows: 10});

generateMapHTML(MAP);

bfs([{
  map: MAP,
  previousMove: 'DOWN'
}]);


