"use strict";
var assert = require('assert')
var util = require('util')
var child_process = require('child_process')

var sat = require('condensate/sat')
var logic = require('condensate/logic')

var or = logic.or;
var and = logic.and;
var nand = logic.nand;
var not = logic.not;
var xor = logic.xor;
var eq = logic.eq;

function ors(ary) {
  if (ary.length == 1)
    return ary[0]
  else
    return or.apply(null, ary)}

function ands(ary) {
  if (ary.length == 1)
    return ary[0]
  else
    return and.apply(null, ary)}

function implies(a, b) {
  return or(not(a), b)}

function onlyOne(vars) {
  return and(ors(vars),
	     atMostOne(vars))}

function atMostOne(vars) {
  assert (vars.length > 0)
  if (vars.length == 1)
    return or(vars[0], not(vars[0])) // should be TRUE
  var parts = []
  for (var a of vars)
    for (var b of vars)
      if (a !== b)
	parts.push(nand(a,b))
  return ands(parts)}

function oneOrTwo(vars) {
  if (vars.length == 2) {
    return ors(vars)}
  else {
    assert(vars.length > 2)
    var head = vars[0]
    var rest = vars.slice(1);
    return or(and(head, atMostOne(rest)),
	      and(not(head), oneOrTwo(rest)))}}

function atMostTwo(vars) {
  if (vars.length <= 2) {
    return or(vars[0], not(vars[0]))}
  else {
    assert(vars.length > 2)
    var head = vars[0]
    var rest = vars.slice(1);
    return or(and(head, atMostOne(rest)),
	      and(not(head), atMostTwo(rest)))}}

function oneTwoOrThree(vars) {
  if (vars.length <= 3) {
    return ors(vars)}
  else {
    assert(vars.length > 3)
    var head = vars[0]
    var rest = vars.slice(1);
    return or(and(head, atMostTwo(rest)),
	      and(not(head), oneTwoOrThree(rest)))}}

function num(d,x,y) { return 'num' + d + '@' + x + ',' + y }
function black(x,y) { return 'b@' + x + ',' + y }

var fs = require('fs')
function writeDimacs(filename, dimacs) {
  var lines = []
  lines.push('p cnf 0 0');
  for (var cl of dimacs.dimacs) {
    lines.push(cl.concat([0]).join(' '))}
  fs.writeFileSync(filename, lines.join('\n'))}




function encodeToDimacs(size, givenDigits, givenBlacks, opts)
{
  var parts = []

  // extra xors ary only there to artificially restrict the search space
  // "xor streamlining"
  // for (var h = 0; h < numExtraXors; h++) {
  //   function rand() {
  //     return Math.floor(Math.random()*size)}
  //   function randvar() {
  //     return num(rand(), rand(), rand())}
  //   parts.push(xor(randvar(), randvar()))
  //   parts.push(xor(xor(randvar(), randvar()),
  //                  xor(randvar(), randvar())))
  //   parts.push(xor(xor(xor(randvar(), randvar()),
  // 		          xor(randvar(), randvar())),
  // 		      xor(xor(randvar(), randvar()),
  // 		          xor(randvar(), randvar()))))
  // }
  
  var xs = []
  for (var x = 0; x < size; x += 1) xs.push(x)

  for (var x of xs) {
    for (var d of xs) {
      var col = []
      for (y of xs)
	col.push(num(d,x,y))
      parts.push(onlyOne(col))}}

  for (var y of xs) {
    for (var d of xs) {
      var row = []
      for (var x of xs)
	row.push(num(d,x,y))
      parts.push(onlyOne(row))}}

  for (var y of xs) {
    for (var x of xs) {
      var digits = []
      for (var d of xs)
	digits.push(num(d,x,y))
      parts.push(onlyOne(digits))}}

  function fieldInRangeIncl(x, y, da, dz) {
    var parts = [];
    for (var d = da; d <= dz; d+=1)
      parts.push(num(d,x,y))
    return ors(parts)}

  for (var x of xs) {
    for (var y of xs) {
      // (x,y) is the upper end of a vertical street,
      // this means (x,y-1) is a black field or off bord.
      for (var yy of xs) {
	if (yy >= y+1) {
	  // (x,yy) is the lower end of a street,
	  // this means (x,yy+1) is a black field or off bord.
	  var condParts = [];
	  if (y-1 >= 0)
	    condParts.push(black(x, y-1))
	  if (yy+1 < size)
	    condParts.push(black(x, yy+1))
	  for (var cy = y; cy <= yy; cy+=1)
	    condParts.push(not(black(x, cy)))
	  
	  var len = yy - y + 1;
	  if (len > opts.straightMaxLength) {
	    parts.push(not(ands(condParts)))
	    continue}
	  var implParts = [];
	  // d1 is the lowest digit assigned to that straight
	  for (var d1 of xs) {
	    // some d1's are too high, not enough digits
	    if (d1 <= size-len) {
	      var dp = [];
	      for (var ty = y; ty <= yy; ty+=1)
		dp.push(fieldInRangeIncl(x, ty, d1, d1+len-1))
	      implParts.push(ands(dp))}}
	  parts.push(
	    implies(ands(condParts),
		    ors(implParts)))}}}}

  // and the same for horizontal straights
  for (var x of xs) {
    for (var y of xs) {
      for (var xx of xs) {
	if (xx >= x+1) {
	  var condParts = [];
	  if (x-1 >= 0)
	    condParts.push(black(x-1, y))
	  if (xx+1 < size)
	    condParts.push(black(xx+1, y))
	  for (var cx = x; cx <= xx; cx+=1)
	    condParts.push(not(black(cx, y)))
	  
	  var len = xx - x + 1;
	  if (len > opts.straightMaxLength) {
	    parts.push(not(ands(condParts)))
	    continue}
	  
	  var implParts = [];
	  // d1 is the lowest digit assigned to that straight
	  for (var d1 of xs) {
	    // some d1's are too high, not enough digits
	    if (d1 <= size-len) {
	      var dp = [];
	      for (var tx = x; tx <= xx; tx+=1)
		dp.push(fieldInRangeIncl(tx, y, d1, d1+len-1))
	      implParts.push(ands(dp))}}
	  parts.push(
	    implies(ands(condParts),
		    ors(implParts)))}}}}
  
  // force one, two or three black fields in every row and every column
  for (var x of xs) {
    var bls = []
    for (var y of xs)
      bls.push(black(x,y))
    parts.push(oneTwoOrThree(bls))}

  for (var y of xs) {
    var bls = []
    for (var x of xs)
      bls.push(black(x,y))
    parts.push(oneTwoOrThree(bls))}

  // force blacks to rotational symmetry
  for (var x of xs) {
    if (x < size/2) {
      for (var y of xs) {
	parts.push(eq(black(x,y), black(size-x-1, size-y-1)))}}}
  
  for (var gd of givenDigits) {
    // console.log('given digit', gd.digit, gd.col, gd.row)
    parts.push(num(gd.digit, gd.col, gd.row))}
  
  for (var gb of givenBlacks) {
    var bl = black(gb.col, gb.row)
    if (!gb.black)
      bl = not(bl)
    parts.push(bl)}

  if (opts.noSingleWhiteCells) {
    for (var y of xs) {
      for (var x of xs) {
	var blacksAround = []
	blacksAround.push(not(black(x,y)))
	if (x-1 >= 0)
	  blacksAround.push(black(x-1, y))
	if (y-1 >= 0)
	  blacksAround.push(black(x, y-1))
	if (x+1 < size)
	  blacksAround.push(black(x+1, y))
	if (y+1 < size)
	  blacksAround.push(black(x, y+1))
	parts.push(not(ands(blacksAround)))}}}
  
  var all = ands(parts)
  var ts = logic.tseitin(all)
  var dimacs = logic.clausesToDimacs(ts)

  console.log('num clauses:', dimacs.dimacs.length)
  return dimacs}
  
  
  // var start = +new Date();
  // let solver = new sat.sat(dimacs.dimacs)
  // solver.searchAllAssignments = true
  // solver.maxNumberAssignments = 3
  // solver.allowLearnClauses = 1
  // console.log('simplify');
  // var res = solver.simplify();
  // assert(res !== sat.contradiction)
  // console.log('solve');
  // res = solver.dpll()
  // var end = +new Date();
  // console.log(solver.stats)
  // console.log('solutions (' + (end-start) + 'ms)')
  // for (var solution of solver.solutions) {
  //   function isTrue(nm) {
  //     return solution.has(dimacs.nameToIndex.get(nm))}

  //   for (var y of xs) {
  //     var row = [];
  //     for (var x of xs) {
  // 	var digit = null;
  // 	for (var d of xs) {
  // 	  if (isTrue(num(d, x, y)))
  // 	    digit = d+1}
  // 	var bl = isTrue(black(x, y)) ? 'X' : ' '
  // 	row.push(bl + digit)}
  //     console.log(row.join(' '))}
  //   console.log('')}

  // for (var rep = 0; rep < 100; rep+=1) {
  //   var start = +new Date();
  //   solver.solutions = []
  //   res = solver.dpll()
  //   var end = +new Date()
  //   console.log('time: ' + (end-start) + 'ms')
  //   console.log('num solutions: ' + solver.solutions.length)
  //   console.log('learned clauses: ' + solver.stats.numLearnedClauses)}}

var someBlacks =
    [// {col:0, row:2, black:1},
     // {col:1, row:3, black:1},
     // {col:2, row:4, black:1},
     // {col:3, row:4, black:1},
     
     // {col:0, row:0, black:0},
     // {col:0, row:1, black:0},
     // {col:0, row:3, black:0},
     // {col:1, row:0, black:0},
     // {col:1, row:1, black:0},
     // {col:1, row:2, black:0},
     // {col:4, row:3, black:1},
     // {col:5, row:2, black:1}
    ]


//str8ts(9, [], someBlacks, 0)
       // [{col:0, row:0, digit:0},
       // 	{col:1, row:1, digit:2},
       // 	{col:2, row:1, digit:4},
       // ],

function dimacsAddClause(dimacs, clause) {
  var d2 = Array.from(dimacs.dimacs);
  d2.push(clause)
  return { dimacs: d2,
	   nameToIndex: dimacs.nameToIndex,
	   indexToName: dimacs.indexToName}}


var unsatisfied = 'unsatisfied';

function tryGetTwoAssignments(dimacs, cont) {
  solveWithMinisat(
    dimacs,
    function (assignment) {
      if (assignment === unsatisfied)
	cont(unsatisfied)
      else {
	var dimacs2 =
	    dimacsAddClause(dimacs,
			    assignment.map(function (l) {return -l}))
	solveWithMinisat(
	  dimacs2,
	  function (assignment2) {
	    if (assignment2 == unsatisfied) {
	      cont([assignment])}
	    else {
	      cont([assignment, assignment2])}})}})}

var dimacsCounter = 1;
function solveWithMinisat(dimacs, cont) {
  var filename = 'undiluted-' + dimacsCounter + '.cnf';
  dimacsCounter += 1;
  console.log('writing', filename)
  writeDimacs(filename, dimacs)

  console.log('solving')
  var ch = child_process.spawn('minisat', [filename, 'output'])
  ch.on('error',
	function (e) {
	  console.log(e)})
  ch.stdout.on('data', function (data) { 0 && console.log(data.toString())})
  ch.stderr.on('data', function (data) { console.log('ERR:', data)})
  ch.on('close', function (data) {
    console.log('sat finished')

    var res = fs.readFileSync('output', {encoding: 'utf8'});
    var lines = res.split('\n')
    if (lines[0] == 'SAT') {
      console.log('what a success!\n\n\n')
      var as1 = lines[1].split(' ');
      var as2 = as1.map(function (l) {return parseInt(l, 10)})
      var as3 = as2.filter(function (l) {return l !== 0})
      cont(as3)}
    else
      cont(unsatisfied)})}

function showCurrentState(size, digits, blacks, assignments, dimacs) {
  var dig = {}
  function key(col,row) { return 'c' + col + 'r' + row}
  for (var d of digits) {
    dig[key(d.col, d.row)] = d.digit}
  var pos = {}
  for (var a of assignments) {
    if (a > 0) {
      var v = dimacs.indexToName.get(Math.abs(a));
      pos[v] = 1}}

  for (var y = 0; y < size; y+=1) {
    var parts = []
    for (var x = 0; x < size; x+=1) {
      var bla = pos[black(x,y)]
      var d = dig[key(x,y)];
      var dq = typeof d === 'number';
      parts.push( (bla ? 'X' : ' ')
		  + (dq ? '' + (d+1) : '_'))}
    console.log(parts.join(' '))}}


function printSolution(size, dimacs, assignments) {
  var pos = {}
  for (var a of assignments) {
    if (a > 0) {
      var v = dimacs.indexToName.get(Math.abs(a));
      pos[v] = 1}}

  for (var y = 0; y < size; y+=1) {
    var parts = []
    for (var x = 0; x < size; x+=1) {
      var d = null;
      for (var dd = 0; dd < size; dd++) {
	if (pos[num(dd, x, y)]) {
	  d = dd;
	  break}}
      var bla = pos[black(x,y)]
      parts.push( (bla ? 'X' : ' ')
		  + (d!=null ? '' + (d+1) : '_'))}
    console.log(parts.join(' '))}}

var url64codes =
    "0123456789_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
function showLink(size, digits, dimacs, assignments) {
  // given digits
  var dig = {}
  function key(col,row) { return 'c' + col + 'r' + row}
  for (var d of digits) {
    dig[key(d.col, d.row)] = d.digit}

  // get vars assigned true
  var tr = {}
  for (var a of assignments) {
    if (a > 0) {
      var v = dimacs.indexToName.get(Math.abs(a));
      tr[v] = 1}}
  
  function isBlack(x, y) {
    return tr[black(x,y)]}
  function isShown(x, y) {
    return typeof dig[key(x,y)] === 'number'}
  function digitAt(x,y) {
    for (var d = 0; d < size; d+=1) {
      if (tr[num(d, x, y)])
	return d}
    assert(false)}
  
  var parts = []
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var val = 0;
      if (isBlack(x, y))
	val += 1;
      if (isShown(x, y))
	val += 2;
      val += 4*digitAt(x, y)
      parts.push(val)}}
  console.log(parts)

  // scrumble it a bit, so you can't read
  // the solution from the url (easily)
  var cr = 1492;
  function next() {
    cr = (cr*3+7)%13913131;
    return cr%64}
  var position =
      parts.map(function (p) {
	var x = p^next()
	assert(x >= 0 && x <= 63)
	return url64codes[x]})

  console.log('URL to play this game:\n',
	      'http://malie.github.io/undiluted/play/str8ts.html?p='
	      + url64codes[size] + position.join(''))
}


function search(size, digits0, blacks0) {
  var digits = Array.from(digits0)
  var blacks = Array.from(blacks0)

  function randBlackInUpperHalf() {
    var s2 = Math.floor(size/2)
    if (size == 2*s2) {
      return [rand(), Math.floor(Math.random()*s2)]}
    else {
      var r = Math.floor(Math.random() * (s2*size + s2 + 1))
      var col = r % size;
      var row = Math.floor(r / size)
      return [col, row]}}
  function rand() {
    return Math.floor(Math.random()*size)}
  function add() {
    if (Math.random() > 0.6) {
      console.log('placing a black field')
      // randomly place (xxx or forbid xxx) a black field
      var rb = randBlackInUpperHalf()
      blacks.push({col: rb[0], row: rb[1],
		   black: 1 /*Math.random() > 0.8 ? 1 : 0*/})}
    else {
      console.log('placing a digit')
      // randomly place a digit
      digits.push({col: rand(), row: rand(), digit: rand()})}}

  add();
  console.log(blacks)
  console.log(digits)

  var opts = {
    straightMaxLength: 4,
    noSingleWhiteCells: true }
  var dimacs = encodeToDimacs(size, digits, blacks, opts);

  tryGetTwoAssignments(
    dimacs,
    function (assignments) {
      if (assignments == unsatisfied) {
	// backtrack to earlier digits/blacks
	console.log('\n\nBACKTRACKING\n\n')
	search(size, digits0, blacks0)}
      else {
	console.log('num assignments: ', assignments.length)
	showCurrentState(size, digits, blacks, assignments[0], dimacs)
	if (assignments.length == 2) {
	  search(size, Array.from(digits), Array.from(blacks))}
	else if (assignments.length == 1) {
	  console.log('YAY, found one!')
	  printSolution(size, dimacs, assignments[0])
	  showLink(size, digits, dimacs, assignments[0])
	}
	else {
	  assert(false)}}})}

search(9, [], [])
