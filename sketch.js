let boardDims = {
    x: 0,
    y: 0,
    width: 500,
    height: 500,
}
updateBoardEnds(boardDims)

let board = null;
let newGame = true;
let gameBoardScores = null;
let player = null;
let computersPlayer = null;

function setup()
{
    createCanvas(windowWidth, windowHeight);

    angleMode(DEGREES)
    frameRate(1000);
    setAttributes('antialias', true);

    background(220);


    board = genBoard();
    player = 2;
    computersPlayer = togglePlayer(player);
    gameBoardScores = genBoardScores(computersPlayer, player);
    pickNextBestMove

}

//  overflow hidden

function draw()
{
    resizeCanvas(windowWidth, windowHeight);
    resizeAndCenterBoard(boardDims);

    background(255);

    if(newGame === true)
    {
        board = genBoard();
        let movesLeft = true;
        let winner = false;
        let player = 2;
        // computersPlayer = random([1, 2]);
        // print(computersPlayer)
        newGame = false;
    }
    else
    {
        // gameBoardScores = genBoardScores(computersPlayer, player);
        // print(gameBoardScores.length);
    }


    let mouseSlotCoords = getMouseSlotCoords(boardDims);

    drawBoard(board, boardDims.x, boardDims.y, boardDims.endX, boardDims.endY);
    if (!(mouseSlotCoords === false))
    {
        let slots = listSlots(boardDims);
        let mouseSlotX = mouseSlotCoords[0];
        let mouseSlotY = mouseSlotCoords[1];
        let slotDims = slots[mouseSlotY][mouseSlotX];
        fill(100, 100, 100);
        rectMode(CORNERS);
        rect(slotDims[0], slotDims[1], slotDims[2], slotDims[3]);
    }
}

function getBoardScores(inBoard, myPlayer, inPlayer, depth = 0)
{
    let stack = [];
    let boardScores = {};

    stack.push(
        {
            'board': inBoard,
            'player': inPlayer,
            'depth': depth
        }
    );

    while (stack.length > 0)
    {
        let args = stack[stack.length - 1];
        let board = args.board;
        let player = args.player;
        let depth = args.depth;

        //   base case, end board
        let winner = getWinner(board);
        if (!(winner === false))
        {
            boardScores[hash(board)] = scoreEndBoard(board, depth, myPlayer);
            stack.pop();
        }
        else if (noMoreMoves(board))
        {
            boardScores[hash(board)] = scoreEndBoard(board, depth, myPlayer);
            stack.pop();
        }
        else    //   nobody won yet, and there are move moves
        {
            let nextBoards = listNextBoards(board, player);
            let allPresent = true;
            let score = 0;
            for (let nextBoard of nextBoards)
            {
                if (hash(nextBoard) in boardScores)
                {
                    score += boardScores[hash(nextBoard)];
                }
                else
                {
                    allPresent = false;
                    let newArgs = {
                        'board': nextBoard,
                        'player': togglePlayer(player),
                        'depth': depth + 1
                    };
                    stack.push(newArgs);
                }
            }
            if (allPresent)
            {
                boardScores[hash(board)] = score;
                stack.pop()
            }
        }
    }
    return boardScores
}

function genBoardScores(myPlayer, currentTurnPlayer)
{
    let emptyBoard = genBoard()
    let boardScores = getBoardScores(emptyBoard, myPlayer, currentTurnPlayer)
    return boardScores
}

function scoreEndBoard(board, depth, myPlayer)
{
    let winner = getWinner(board);
    if (winner === false)
    {
        return -100 * Math.pow(2, 9 - depth)    //   tie is always depth 9..
    }
    else if (winner == togglePlayer(myPlayer))
    {
        return -1000 * Math.pow(2, 9 - depth)
    }
    else if (winner == myPlayer)
    {
        return 1000000 / Math.pow(2, depth)
    }
}

function resizeAndCenterBoard(boardDims)
{
    let scaler = 0.45;
    boardDims.width = windowWidth * scaler;
    boardDims.height = windowWidth * scaler;

    updateBoardEnds(boardDims);
    let halfWidth = boardDims.width / 2;
    let halfHeight = boardDims.height / 2;
    let centerX = windowWidth / 2;
    let centerY = windowHeight / 2;
    boardDims.x = centerX - halfWidth;
    boardDims.y = centerY - halfHeight;
    updateBoardEnds(boardDims);

}

function updateBoardEnds(boardDims)
{
    boardDims['endX'] = boardDims.x + boardDims.width
    boardDims['endY'] = boardDims.y + boardDims.height
}

function isInside(x, y, x1, y1, x2, y2)
{
    if (x < x1)
    {
        return false;
    }
    else if (x > x2)
    {
        return false;
    }
    else if (y < y1)
    {
        return false;
    }
    else if (y > y2)
    {
        return false;
    }
    else
    {
        return true;
    }

}

//  function to list slots
function listSlots(boardDims)
{
    let slots = []
    let thirdWidth = boardDims.width / 3.0;
    let thirdHeight = boardDims.height / 3.0;
    for (let row = 0; row < 3; row++)
    {
        let rowSlots = []
        for (let col = 0; col < 3; col++)
        {
            let tlx = boardDims.x + row * thirdWidth;
            let brx = tlx + thirdWidth;
            let tly = boardDims.y + col * thirdHeight;
            let bry = tly + thirdHeight;

            let slot = [tlx, tly, brx, bry]
            rowSlots.push(slot)
        }
        slots.push(rowSlots)
    }
    return slots;
}

function getMouseSlotCoords(boardDims)
{
    let slots = listSlots(boardDims)
    for (let row = 0; row < 3; row++)
    {
        for (let col = 0; col < 3; col++)
        {
            let slot = slots[row][col];
            if (isInside(mouseX, mouseY, slot[0], slot[1], slot[2], slot[3]))
            {
                return [col, row];
            }
        }
    }
    return false;
}

function unHash(hash)
{
    let boardConcat = []
    for (c of hash)
    {
        boardConcat.push(parseInt(c))
    }
    let board = [
        [boardConcat[0], boardConcat[1], boardConcat[2]],
        [boardConcat[3], boardConcat[4], boardConcat[5]],
        [boardConcat[6], boardConcat[7], boardConcat[8]],
    ]
    return board
}

function togglePlayer(currentPlayer)
{
    if (currentPlayer == 2)
    {
        return 1;
    }
    return 2;
}

function hash(board)
{
    let rowKeys = []
    for (let r = 0; r < 3; r++)
    {
        rowKeys.push(board[r].join(''))
    }
    let key = rowKeys.join('');
    return key
}


function clone2d(arr)
{
    var newArray = [];
    for (var i = 0; i < arr.length; i++)
        newArray[i] = arr[i].slice();
    return newArray;
}


function drawX(x1, y1, x2, y2)
{
    let xMid = (x2 - x1) / 2 + x1;
    let yMid = (y2 - y1) / 2 + y1;

    let poofyness = (x2 - x1) / 10.0;
    rectMode(CORNERS);
    noStroke();
    fill(255)
    push();
    translate(xMid, yMid);
    rotate(45);
    rect(-poofyness, y1 - yMid, poofyness, y2 - yMid);
    rect(x1 - xMid, -poofyness, x2 - xMid, poofyness);
    pop();
}


function drawO(x1, y1, x2, y2)
{
    let poofyness = (x2 - x1) / 5.0;
    let shrinkyness = (x2 - x1) / 6.0;

    ellipseMode(CORNERS);
    strokeWeight(poofyness);
    stroke(255, 255, 255);
    noFill();
    ellipse(x1 + shrinkyness, y1 + shrinkyness, x2 - shrinkyness, y2 - shrinkyness);
}


//  draw board
function drawBoard(board, x1, y1, x2, y2)
{
    let xThird = (x2 - x1) / 3.0;
    let yThird = (y2 - y1) / 3.0;
    let x2Thirds = xThird * 2.0;
    let y2Thirds = yThird * 2.0;
    let poofyness = (x2 - x1) / 100.0;

    // 4 lines
    fill(0);
    noStroke();
    rectMode(CORNERS);

    rect(x1 + xThird - poofyness, y1, x1 + xThird + poofyness, y2);
    rect(x1 + x2Thirds - poofyness, y1, x1 + x2Thirds + poofyness, y2);
    rect(x1, y1 + yThird - poofyness, x2, y1 + yThird + poofyness);
    rect(x1, y1 + y2Thirds - poofyness, x2, y1 + y2Thirds + poofyness);

    /*
    const foobar = ['A', 'B', 'C'];
    
    for (const [index, element] of foobar.entries()) {
        console.log(index, element);
    }
    */
    for (const [rowNum, row] of board.entries())
    {
        for (const [colNum, col] of row.entries())
        {
            if (col == 1)
            {
                let xPos = x1 + colNum * xThird;
                let yPos = y1 + rowNum * yThird;
                let endX = xPos + xThird;
                let endY = yPos + yThird;
                drawO(xPos, yPos, endX, endY);
            } else if (col == 2)
            {
                let xPos = x1 + colNum * xThird;
                let yPos = y1 + rowNum * yThird;
                let endX = xPos + xThird;
                let endY = yPos + yThird;
                drawX(xPos, yPos, endX, endY);
            }
        }
    }

    // noFill();
    // stroke(0.0);
    // rect(x1, y1, x2, y2);
}

function genBoard()
{
    let board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    return board;
}


function getWinner(board)
{
    targets = [1, 2]
    for (let target of targets)
    {
        //  check rows
        for (let r = 0; r < 3; r++)
        {
            let numTargets = 0;
            for (let col of board[r])
            {
                if (col == target)
                {
                    numTargets++;
                }
            }
            if (numTargets == 3)
            {
                return target;
            }
        }


        //  check cols
        for (let c = 0; c < 3; c++)
        {
            let numTargets = 0;
            for (let r = 0; r < 3; r++)
            {
                let piece = board[r][c];
                if (piece == target)
                {
                    numTargets++;
                }
            }
            if (numTargets == 3)
            {
                return target;
            }
        }

        //  check diagonals
        let diagPositions = [
            [
                [0, 0],
                [1, 1],
                [2, 2]
            ],
            [
                [0, 2],
                [1, 1],
                [2, 0]
            ]
        ]
        for (let diag of diagPositions)
        {
            let numTargets = 0;
            for (const [x, y] of diag)
            {
                let piece = board[y][x];
                if (piece == target)
                {
                    numTargets++;
                }
            }
            if (numTargets == 3)
            {
                return target;
            }
        }
    }
    return false;
}

function listEmpties(board)
{
    let empties = []
    for (let row = 0; row < 3; row++)
    {
        for (let col = 0; col < 3; col++)
        {
            let piece = board[row][col];
            if (piece == 0)
            {
                empties.push([col, row])
            }
        }
    }
    return empties;
}

function listNextBoards(board, player)
{
    let empties = listEmpties(board)

    let nextBoards = [];
    for (let empty of empties)
    {
        let anotherBoard = clone2d(board);
        let x = empty[0]
        let y = empty[1]

        anotherBoard[y][x] = player;
        nextBoards.push(anotherBoard);
    }
    return nextBoards;
}

function isMoreMoves(board)
{
    for (let row of board)
    {
        for (let col of row)
        {
            if (col == 0)
            {
                return true;
            }
        }
    }
    return false;
}

function noMoreMoves(board)
{
    return !isMoreMoves(board);
}