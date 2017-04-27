const RUNNER = '$';
const WALL   = '@';
const VISITED = '#';

let isGoalState = (state) => {
  let map = state.map;
  return map[map.length - 1].includes(VISITED);
};

let findPlayer = (map) => {
  let row = map.findIndex( e => e.includes(RUNNER) );
  return row >= 0 ? [row,map[row].indexOf(RUNNER)] : [null,null];
};

let mapToString = (map) => {
  return map.map( row => row.join('') ).join("\n");
};


let runStreak = (map,from) => {
  let [row,col] = from;
  let mapCopy = JSON.parse( JSON.stringify(map) );

  mapCopy[row][col] = VISITED;

  while(true) {
    let nextSteps = [
      [row-1,col],
      [row,col+1],
      [row+1,col],
      [row, col-1]
    ].filter(([r,c]) => mapCopy[r] && mapCopy[r][c] == ' ');

    if(nextSteps.length == 0){
      mapCopy[row][col] = VISITED;
      break;
    } else if(nextSteps.length == 1) {
      mapCopy[row][col] = VISITED;
      [row,col] = nextSteps[0];
    } else {
      mapCopy[row][col] = RUNNER;
      break;
    }
  }

  return mapCopy;
};

let successors = (state) => {
  let map = state.map;
  let [prow, pcol] = findPlayer(map);

  if(prow == null) return [];

  let results = [];

  map[prow][pcol] = VISITED;

  try {
    if(map[prow+1][pcol] == ' ')
      results.unshift({ map: runStreak(map, [prow+1,pcol]) })

    if(map[prow][pcol+1] == ' ')
      results.unshift({ map: runStreak(map, [prow,pcol+1]) })

    if(map[prow][pcol-1] == ' ')
      results.unshift({ map: runStreak(map, [prow,pcol-1]) })

    if(map[prow-1][pcol] == ' ')
      results.unshift({ map: runStreak(map, [prow-1,pcol]) })

  } catch(e) {
    console.error('Index out of bounds while finding successors?',e);
  }

  return results;
};

let dfs = (frontier) => {
  let visited = [];

  let mapPainterBuffer = generateMapPainter(frontier[0].map);

  while(true) {
    let node = frontier.pop();
    if(!node) break;

    let strMap = mapToString(node.map);
    if(visited.includes(strMap)) continue;

    visited.push(strMap);
    mapPainterBuffer.push(node.map);

    if(isGoalState(node)) {
      break;
    } else frontier = frontier.concat(successors(node));
  }

};

let bfs = (frontier) => {
  let visited = [];

  let mapPainterBuffer = generateMapPainter(frontier[0].map);

  while(true) {
    let node = frontier.shift();
    if(!node) break;

    let strMap = mapToString(node.map);
    if(visited.includes(strMap)) continue;

    visited.push(strMap);
    mapPainterBuffer.push(node.map);

    if(isGoalState(node)) {
      break;
    } else frontier = frontier.concat(successors(node));
  }

};



// View Code

let generateMapPainter = (iMap, delay = 1000) => {
 generateMapHTML(iMap);

  let mapPainterBuffer = [];
  let mapPainter = () => {
    let map = mapPainterBuffer.shift();
    if(map) paintMapHTML(map);
    else clearInterval(mapPainterTimer);
  };
  let mapPainterTimer = setInterval(mapPainter, delay);

  return mapPainterBuffer;
};

let generateMapHTML = (map) => {
  let rows = map.map((row,i) => {
    let cols = row.map((col,j) => {
      return `<div id="r${i}c${j}" class="col ${ col == WALL ? 'wall' : '' }"></div>`;
    }).join('');

    return `<div class="row">${cols}</div>`;
  }).join('');

  $('.map').html(rows);
};

let paintMapHTML = (map) => {
  map.forEach((row,i) => {
    row.forEach((col,j) => {
      let $pixel = $(`#r${i}c${j}`);
      if(col == '#' && !$pixel.hasClass('walked'))
        $pixel.addClass('walked');
    });
  });
}

let generateRandomMaze = (options) => {
  let mazeMap = amaze(options);
  let entryColumnIndex = mazeMap[0].indexOf(' ');
  mazeMap[0][entryColumnIndex] = RUNNER;

  mazeMap.pop(); // Amaze adds an empty row as the last row. We dont need it.
  return mazeMap;
};

let MAP = generateRandomMaze({ rows: 9, cols: 9});

bfs([{
  map: MAP,
}]);


