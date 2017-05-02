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

let deepCopy = (obj) => JSON.parse( JSON.stringify(obj) );

let runStreak = (state,from) => {
  let [row,col] = from;
  let stateCopy = deepCopy(state);
  let map = stateCopy.map;

  map[row][col] = VISITED;

  while(true) {
    let nextSteps = [
      [row-1,col],
      [row,col+1],
      [row+1,col],
      [row, col-1]
    ].filter(([r,c]) => map[r] && map[r][c] == ' ');

    if(nextSteps.length == 0){
      map[row][col] = VISITED;
      stateCopy.distanceToDestination = row == stateCopy.destination[0] && col == stateCopy.destination[1] ? 0 : Infinity;
      break;
    } else if(nextSteps.length == 1) {
      map[row][col] = VISITED;
      [row,col] = nextSteps[0];
    } else {
      map[row][col] = RUNNER;
      stateCopy.distanceToDestination = Math.sqrt(
        Math.pow(Math.abs(stateCopy.destination[0]-row),2)
        +
        Math.pow(Math.abs(stateCopy.destination[1]-col),2)
      );
      break;
    }
  }

  return stateCopy;
};

let successors = (state) => {
  let map = state.map;
  let [prow, pcol] = findPlayer(map);

  if(prow == null) return [];

  let results = [];

  map[prow][pcol] = VISITED;

  try {
    if(map[prow+1][pcol] == ' ')
      results.unshift(runStreak(state, [prow+1,pcol]));

    if(map[prow][pcol+1] == ' ')
      results.unshift(runStreak(state, [prow,pcol+1]));

    if(map[prow][pcol-1] == ' ')
      results.unshift(runStreak(state, [prow,pcol-1]));

    if(map[prow-1][pcol] == ' ')
      results.unshift(runStreak(state, [prow-1,pcol]));

  } catch(e) {
    console.error('Index out of bounds while finding successors?',e);
  }

  return results;
};

let dfs = (frontier) => {
  let mapPainterBuffer = generateMapPainter(frontier[0].map);

  while(true) {
    let node = frontier.pop();
    if(!node) break;

    mapPainterBuffer.push(node.map);

    if(isGoalState(node)) {
      break;
    } else frontier = frontier.concat(successors(node));
  }

};

let bfs = (frontier) => {
  let mapPainterBuffer = generateMapPainter(frontier[0].map);

  while(true) {
    let node = frontier.shift();
    if(!node) break;

    mapPainterBuffer.push(node.map);

    if(isGoalState(node)) {
      break;
    } else frontier = frontier.concat(successors(node));
  }

};

let astar = (frontier) => {
  let mapPainterBuffer = generateMapPainter(frontier[0].map);

  while(true) {
    let node = frontier.shift();
    if(!node) break;

    mapPainterBuffer.push(node.map);

    if(isGoalState(node)) {
      break;
    } else frontier = frontier.concat(successors(node));

    frontier.sort((a,b) => (a.cost + a.distanceToDestination) - (b.cost + b.distanceToDestination));
  }

};


// View Code

let generateMapPainter = (iMap, delay = 1000) => {
 let $mapConatiner = generateMapHTML(iMap);

  let mapPainterBuffer = [];
  let mapPainter = () => {
    let map = mapPainterBuffer.shift();
    if(map) paintMapHTML($mapConatiner, map);
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

  let $mapConatiner = $(`<div class="map">${rows}</div>`);
  $('body').append($mapConatiner);

  return $mapConatiner;
};

let paintMapHTML = ($container, map) => {
  map.forEach((row,i) => {
    row.forEach((col,j) => {
      let $pixel = $container.find(`#r${i}c${j}`);
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


let MAP = generateRandomMaze({ rows: 3, cols: 3});
console.log(mapToString(MAP));

bfs([{
  map: deepCopy(MAP),
  cost: 0,
  destination: [MAP.length-1,MAP[MAP.length-1].indexOf(' ')]
}]);

dfs([{
  map: deepCopy(MAP),
  cost: 0,
  destination: [MAP.length-1,MAP[MAP.length-1].indexOf(' ')]
}]);

astar([{
  map: deepCopy(MAP),
  cost: 0,
  destination: [MAP.length-1,MAP[MAP.length-1].indexOf(' ')]
}]);


