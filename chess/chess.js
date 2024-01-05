function chess({canvas, x, y=0, height=128, width=128, pgn, step=0, title}){
const _ = void 0
const {ceil, cos, floor, max, min, PI, random, sin, sqrt} = Math
const phi = (1 + sqrt(5)) * .5
const tau = 2 * PI
const tau_8 = tau / 8
const rt2 = sqrt(2)
const rt3_2 = sqrt(3)/2

const virt_height = 16
const virt_width = 16
let z = 1 // zoom
const dl = 16
const pip_size = 2.75

const W = 8
const V = W-1

const colors = {
	bp: 'rgba(0,0,0,.75)',
	wp: 'rgba(255,255,255,.75)',
	bs: 'rgba(0,0,0,.1)',
	ws: 'rgba(255,255,255,.1)',
}
const polygons = []

const c = canvas.getContext('2d')

function resize(event){
	const scale = window.devicePixelRatio || 1
	const canvas_height = floor(min(height, width))
	x ??= floor((width - canvas_height) / 2)
	z = floor(canvas_height / virt_height)
	canvas.style.height = canvas_height + 'px'
	canvas.height = virt_height * scale * z
	canvas.width = virt_width * scale * z
	canvas.style.height = (virt_height*z)+'px'
	canvas.style.width = (virt_width*z)+'px'
	canvas.style.left = x+'px'
	canvas.style.top = y+'px'
	canvas.style.display = 'block'
	c.scale(scale, scale)
	display()
}

window.addEventListener('resize', resize)

function draw_shape(path, x, y, m = 1){
	m = m*z
	c.beginPath()
	c.moveTo(x*z + (path[0][0])*m, y*z + (path[0][1])*m)
	for(i=1; i<path.length; ++i){
		c.lineTo(x*z + (path[i][0])*m, y*z + (path[i][1])*m)
	}
	c.fill()
}

function polygon(sides, radius = 1, rot = 0){
	return Array(sides).fill().map((_,i)=>([
		radius * cos(i * tau / sides - rot),
		radius * sin(i * tau / sides - rot),
	]))
}

function polygram(sides, radius = 1, rot = 0, inner_radius = .5/phi){
	return Array(sides*2).fill().map((_,i)=>([
		(i%2 ? 1 : inner_radius) * radius * sin(i * tau / (2*sides) - rot),
		(i%2 ? 1 : inner_radius) * radius * cos(i * tau / (2*sides) - rot),
	]))
}

function draw_die(
	pips,
	x = 0,
	y = 0,
){
	const s = ceil(sqrt(pips.length))
	const dg = dl/s
	pips.forEach((pip, i)=>{
		if(!pip){ return }
		c.fillStyle = pip.color
		draw_shape(
			pip.shape,
			x + dg*(.5 + i % s),
			y + dg*(.5 + floor(i / s)),
		)
	})
}

const chess_shapes = {
	b: {
		name: 'bishop black',
		color: colors.bp,
		shape: polygram(4, dl/((5+1) * pip_size), 0, 1/3),
	},
	k: {
		name: 'king black',
		color: colors.bp,
		shape: polygon(8, dl/((6+1) * pip_size), tau/16),
	},
	n: {
		name: 'knight black',
		color: colors.bp,
		shape: [[0,0],[2,0],[2,3],[1,3],[1,1],[0,1]]
			.map(a=>[(a[0]-1.5)/2, (a[1]-1.5)/2]),
	},
	p: {
		name: 'pawn black',
		color: colors.bp,
		shape: [[0,0],[3,0],[2,3],[1,3]]
			.map(a=>[(a[0]-1.5)/3, (a[1]-1.5)/3]),
	},
	q: {
		name: 'queen black',
		color: colors.bp,
		shape: polygram(8, dl/((6+1) * pip_size), tau/16, 2/3),
	},
	r: {
		name: 'rook black',
		color: colors.bp,
		shape: [[1,1],[1,0],[2,0],[2,1],[3,1],[3,2],[2,2],[2,3],[1,3],[1,2],[0,2],[0,1]]
			.map(a=>[(a[0]-1.5)/2, (a[1]-1.5)/2]),
	},
	B: {
		name: 'bishop white',
		color: colors.wp,
		shape: polygram(4, dl/((5+1) * pip_size), 0, 1/3),
	},
	K: {
		name: 'king white',
		color: colors.wp,
		shape: polygon(8, dl/((6+1) * pip_size), tau/16),
	},
	N: {
		name: 'knight white',
		color: colors.wp,
		shape: [[0,0],[2,0],[2,3],[1,3],[1,1],[0,1]]
			.map(a=>[(a[0]-1.5)/2, (a[1]-1.5)/2]),
	},
	P: {
		name: 'pawn white',
		color: colors.wp,
		shape: [[0,3],[3,3],[2,0],[1,0]]
			.map(a=>[(a[0]-1.5)/3, (a[1]-1.5)/3]),
	},
	Q: {
		name: 'queen white',
		color: colors.wp,
		shape: polygram(8, dl/((6+1) * pip_size), tau/16, 2/3),
	},
	R: {
		name: 'rook white',
		color: colors.wp,
		shape: [[1,1],[1,0],[2,0],[2,1],[3,1],[3,2],[2,2],[2,3],[1,3],[1,2],[0,2],[0,1]]
			.map(a=>[(a[0]-1.5)/2, (a[1]-1.5)/2]),
	},
}
function chessboard(black, white){
	const black_checker = {shape:polygon(4, rt2, tau_8),color:black}
	const white_checker = {shape:polygon(4, rt2, tau_8),color:white}
	return Array(W*W).fill().map((_, i) => (i+floor(i/W))%2 ? black_checker : white_checker)
}

const chess_initial_position = [].concat(
	'rnbqkbnr'.split(''),
	Array(W).fill('p'),
	Array(W*(W-4)).fill(),
	Array(W).fill('P'),
	'RNBQKBNR'.split(''),
)

const digit_pattern = /\d/
const piece_pattern = /[BKNPQR]/
const file_pattern = /[a-h]/

const parse_pgn_mode = [
	'none',
	'tag_key',
	'tag_val',
	'piece',
	'from',
	'file',
	'end_move',
].reduce((o, x)=>(o[x]=Symbol(x), o),{})

const blank_move = () => ({piece:'',from:'',file:'',rank:''})

function parse_pgn(pgn){
	const game = {
		moves: [],
		pgn: pgn,
		tags: {},
	}
	const tokens = []
	let mode = parse_pgn_mode.none, pgn_length = pgn.length, tag_key, tag_val
	let move = blank_move()
	for(let i = 0; i < pgn_length; ++i){
		let c = pgn[i]
		if(c === '['){
			mode = parse_pgn_mode.tag_key
			tag_key = ''
		}
		else if(c === ']'){
			mode = parse_pgn_mode.none
		}
		else if(mode === parse_pgn_mode.tag_key){
			if(c === '"'){
				game.tags[tag_key] = ''
				mode = parse_pgn_mode.tag_val
			}
			else {
				tag_key += c
			}
		}
		else if(mode === parse_pgn_mode.tag_val){
			if(c !== '"'){
				game.tags[tag_key] += c
			}
		}
		else if(c === 'O'){
			const castle = pgn.slice(i, i+5)
			if(castle === 'O-O-O'){
				move.castle_long = true
				i += 4
			}
			else {
				move.castle_short = true
				i += 2
			}
			game.moves.push(move)
			move = blank_move()
			mode = parse_pgn_mode.end_move
		}
		else if(piece_pattern.test(c)){
			move.piece = c
			mode = parse_pgn_mode.piece
		}
		else if(file_pattern.test(c)){
			if(mode === parse_pgn_mode.file){
				move.from = move.file
				move.file = c
			}
			else {
				move.file = c
				mode = parse_pgn_mode.file
			}
		}
		else if(digit_pattern.test(c)){
			if(mode === parse_pgn_mode.piece){
				move.from = c
				mode = parse_pgn_mode.from
			}
			// assume 1-digit rank
			else if(mode === parse_pgn_mode.file) {
				move.rank = c
				game.moves.push(move)
				move = blank_move()
				mode = parse_pgn_mode.end_move
			}
		}
	}
	return game
}

const all_squares = Array(W*W).fill().map((_, i)=>i)
const file_nicknames = Array(W).fill().map((_, i) =>
	String.fromCharCode('a'.charCodeAt(0) + i)
)
const file_values = Object.fromEntries(file_nicknames.map((f, i) => [f, i]))

const rank_and_file = Object.fromEntries(
	Array(W).fill().map((_,i)=>([W-i, rank(W, i)]))
	.concat(
		file_nicknames.map((c, i)=>[c, file(W, i)])
	)
)
function file(size, n){
	return Array(size).fill().map((_, i) => i*size + n)
}
function rank(size, n){
	return Array(size).fill().map((_, i) => n*size + i)
}

function knight_moves(W, i){
	const x = i % W
	const y = floor(i / W)
	return [
		(x > 0) && (y > 1) && (i - 2*W - 1),
		(x < W-1) && (y > 1) && (i - 2*W + 1),
		(x > 1) && (y > 0) && (i - W - 2),
		(x < W-2) && (y > 0) && (i - W + 2),
		(x > 1) && (y < W-1) && (i + W - 2),
		(x < W-2) && (y < W-1) && (i + W + 2),
		(x > 0) && (y < W-2) && (i + 2*W - 1),
		(x < W-1) && (y < W-2) && (i + 2*W + 1),
	]
}

function unobstructed_bishop_moves(W, cell, piece, board){
	const x = cell % W
	const y = floor(cell / W)
	const lines = [
		// (neg, neg)
		Array(min(x, y)).fill().map(
			(_,i)=>(i+=1, cell - i - i*W)),
		// pos, pos
		Array(min(V-x, V-y)).fill().map(
			(_,i)=>(i+=1, cell + i + i*W)),
		// neg, pos
		Array(min(x, V-y)).fill().map(
			(_,i)=>(i+=1, cell - i + i*W)),
		// pos, neg
		Array(min(V-x, y)).fill().map(
			(_,i)=>(i+=1, cell + i - i*W)),
	]
	const squares = []
	lines.forEach(line => {
		for(let i = 0; i < line.length; ++i){
			const n = line[i]
			if(board[n] === piece){	squares.push(n)	}
			if(board[n]){ break }
		}
	})
	return squares
}

function unobstructed_rook_moves(W, cell, piece, board){
	const x = cell % W
	const y = floor(cell / W)
	const lines = [
		// negative x
		Array(x).fill().map(
			(_,i)=>(i+=1, cell - i)),
		// positive x
		Array(V-x).fill().map(
			(_,i)=>(i+=1, cell + i)),
		// negative y
		Array(y).fill().map(
			(_,i)=>(i+=1, cell - i*W)),
		// positive y
		Array(V-y).fill().map(
			(_,i)=>(i+=1, cell + i*W)),
	]
	const squares = []
	lines.forEach(line => {
		for(let i = 0; i < line.length; ++i){
			const n = line[i]
			if(board[n] === piece){	squares.push(n)	}
			if(board[n]){ break }
		}
	})
	return squares
}

function unobstructed_queen_moves(W, cell, piece, board){
	return unobstructed_bishop_moves(W, cell, piece, board)
		.concat(
			unobstructed_rook_moves(W, cell, piece, board)
		)
}

function from_candidates(piece, from, board){
	let squares = from ? rank_and_file[from] : all_squares
	return squares.filter(i => board[i] === piece)
}

function board_debug(board){
	return '\n' + Array(W).fill().map((_,i)=>
		board
			.slice(i*W, (i+1)*W)
			.map(c => c||'.').join('')
	).join('\n')
}

function pgn_move(board, move, move_index){
	let {piece, from, file, rank} = move
	let moved = false
	const player = move_index % 2
	const cell = (W * (W - parseInt(rank))) + file_values[file]
	piece ||= 'P'
	const color_piece = (player === 1) ? piece.toLowerCase() : piece
	const king = (player === 1) ? 'k' : 'K'
	const rook = (player === 1) ? 'r' : 'R'
	const dir = -1 * (player * 2 - 1)
	const back_rank = (player === 1) ? 0 : (W * (W - 1))
	board = board.concat()
	if(move.castle_long){
		board[0 + back_rank] = _
		board[2 + back_rank] = king
		board[3 + back_rank] = rook
		board[4 + back_rank] = _
		moved = true
	}
	if(move.castle_short){
		board[4 + back_rank] = _
		board[5 + back_rank] = rook
		board[6 + back_rank] = king
		board[7 + back_rank] = _
		moved = true
	}
	let froms = moved ? [] : from_candidates(color_piece, from, board)
	if(!moved && (froms.length === 0)){
		console.warn('Moved piece not found', move_index, move, board_debug(board))
		moved = true
	}
	if(!moved && (froms.length === 1)){
		board[froms[0]] = _
		moved = true
	}
	if(!moved && (piece === 'P')){
		let prev = cell + (W*dir)
		if(from){
			prev += (from > file) ? 1 : -1
		}
		const prev2 = cell + (W*2*dir)
		if(board[prev]){ board[prev] = _ }
		else if(board[prev2]){ board[prev2] = _ }
		moved = true
	}
	if(!moved && (piece === 'N')){
		froms = froms.filter(x => knight_moves(W, cell).includes(x))
	}
	if(!moved && (piece === 'B')){
		froms = froms.filter(x => unobstructed_bishop_moves(W, cell, color_piece, board).includes(x))
	}
	if(!moved && (piece === 'R')){
		froms = froms.filter(x => unobstructed_rook_moves(W, cell, color_piece, board).includes(x))
	}
	if(!moved && (piece === 'Q')){
		froms = froms.filter(x => unobstructed_queen_moves(W, cell, color_piece, board).includes(x))
	}
	if(!moved && (froms.length === 0)){
		console.warn('Moved piece not found with move validation', move_index, move, froms, board_debug(board))
		moved = true
	}
	if(!moved && (froms.length === 1)){
		board[froms[0]] = _
		moved = true
	}
	if(!moved && (froms.length > 1)){
		console.warn('Unspecified move', move_index, move, froms, board_debug(board))
		moved = true
	}
	if(cell >= 0){
		board[cell] = color_piece
	}
	return board
}

const chess_game = parse_pgn(pgn)
const chess_positions = []
chess_positions.push(chess_initial_position.concat())

function move_text(step){
	return `${floor(step/2)+1}${step%2 ? '…' : '.'}`
}

for(let i = 0; i < chess_game.moves.length; ++i){
	chess_positions.push(
		pgn_move(chess_positions[i], chess_game.moves[i], i)
	)
}
const title_text = `${move_text(step)} of ${move_text(chess_positions.length-1)}  | ${Object.values(chess_game.tags).join(' | ')}`
title ? (title.innerText = title_text) : (canvas.title = title_text)

const cb = chessboard(colors.bs, colors.ws)
function display(){
	c.clearRect(0, 0, virt_width*z, virt_height*z)
	draw_die(cb)
	draw_die(
		chess_positions[step].map(p => chess_shapes[p]),
	)
}

resize()
}