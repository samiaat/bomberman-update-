const { TILE } = require('./game.js');

const MAP_WIDTH_CELLS = 15;
const MAP_HEIGHT_CELLS = 13;
const CELL_SIZE = 50;

function getSafeMoves(player, gameState) {
    const { map, bombs } = gameState;
    const { x, y, size } = player;
    const playerCellX = Math.floor((x + size / 2) / CELL_SIZE);
    const playerCellY = Math.floor((y + size / 2) / CELL_SIZE);

    const possibleMoves = [
        { dx: 0, dy: -1, name: 'up' },
        { dx: 0, dy: 1, name: 'down' },
        { dx: -1, dy: 0, name: 'left' },
        { dx: 1, dy: 0, name: 'right' },
        { dx: 0, dy: 0, name: 'stay' },
    ];

    const explosionCells = new Set();
    bombs.forEach(bomb => {
        explosionCells.add(`${bomb.x},${bomb.y}`);
        for (let i = 1; i <= bomb.flame; i++) {
            explosionCells.add(`${bomb.x + i},${bomb.y}`);
            explosionCells.add(`${bomb.x - i},${bomb.y}`);
            explosionCells.add(`${bomb.x},${bomb.y + i}`);
            explosionCells.add(`${bomb.x},${bomb.y - i}`);
        }
    });

    const safeMoves = possibleMoves.filter(move => {
        const nextCellX = playerCellX + move.dx;
        const nextCellY = playerCellY + move.dy;

        if (nextCellX < 0 || nextCellX >= MAP_WIDTH_CELLS || nextCellY < 0 || nextCellY >= MAP_HEIGHT_CELLS) {
            return false;
        }

        if (explosionCells.has(`${nextCellX},${nextCellY}`)) {
            return false;
        }

        const tile = map[nextCellY][nextCellX];
        if (tile === TILE.WALL || tile === TILE.BLOCK) {
            return false;
        }

        return true;
    });

    return safeMoves.length > 0 ? safeMoves : possibleMoves;
}

function decideMove(player, gameState) {
    const safeMoves = getSafeMoves(player, gameState);
    const randomIndex = Math.floor(Math.random() * safeMoves.length);
    return safeMoves[randomIndex].name;
}

function updateAI(aiPlayer, gameState, gameActions) {
    const { handlePlayerStartMoving, handlePlayerStopMoving, handlePlaceBomb } = gameActions;

    // Simple AI: move randomly and place bombs
    const move = decideMove(aiPlayer, gameState);
    if (move !== 'stay') {
        handlePlayerStartMoving(aiPlayer, move);
    } else {
        handlePlayerStopMoving(aiPlayer, 'up');
        handlePlayerStopMoving(aiPlayer, 'down');
        handlePlayerStopMoving(aiPlayer, 'left');
        handlePlayerStopMoving(aiPlayer, 'right');
    }

    if (Math.random() < 0.1) {
        handlePlaceBomb(aiPlayer, gameState);
    }
}

module.exports = { updateAI };
