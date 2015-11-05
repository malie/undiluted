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

var ors = logic.ors;
var ands = logic.ands;
var implies = logic.implies;
var onlyOne = logic.onlyOne;
var atMostOne = logic.atMostOne;
var oneOrTwo = logic.oneOrTwo;
var oneTwoOrThree = logic.oneTwoOrThree;
var atMostTwo = logic.atMostTwo;
var atMostThree = logic.atMostThree;


function num(d,x,y) { return 'num' + d + '@' + x + ',' + y }

// a white field
function white(x,y) { return 'w@' + x + ',' + y }

// a field with a number
function numfield(x,y) { return 'nu@' + x + ',' + y }

// a black without a digit
function black(x,y) { return 'b@' + x + ',' + y }

// a black with a digit (that is shown from the beginning on)
function nblack(x,y) { return 'nb@' + x + ',' + y }

// xblack: black with digit or without
function xblack(x,y) { return 'xb@' + x + ',' + y }


function largestDimacsVar(dimacs) {
  var m = 0;
  for (var clause of dimacs.dimacs) {
    for (var lit of clause) {
      var v = Math.abs(lit)
      if (v > m)
	m = v}}
  return m}

var fs = require('fs')
function writeDimacs(filename, dimacs) {
  var lines = []
  var numClauses = dimacs.dimacs.length;
  var numVars = largestDimacsVar(dimacs)
  for (var v = 0; v <= numVars; v+=1)
    lines.push('c ' + v + ' ' + dimacs.indexToName.get(v))
  lines.push('p cnf ' + numVars + ' ' + numClauses);
  for (var cl of dimacs.dimacs) {
    lines.push(cl.concat([0]).join(' '))}
  fs.writeFileSync(filename, lines.join('\n'))}




function encodeToDimacs(size,
			givenDigits,
			givenBlacks,
			givenNBlacks,
			opts)
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

  for (var gd of givenDigits) {
    parts.push(num(gd.digit, gd.col, gd.row))
    parts.push(white(gd.col, gd.row))}
  
  for (var gb of givenBlacks)
    parts.push(black(gb.col, gb.row))

  var gnblacks = {}
  function key(c,r) { return 'c' + c + 'r' + r}
  for (var gb of givenNBlacks) {
    gnblacks[key(gb.col, gb.row)] = gb.nblack
    parts.push(nblack(gb.col, gb.row))
    parts.push(num(gb.digit, gb.col, gb.row))}
  for (var y of xs) {
    for (var x of xs) {
      if (!gnblacks[key(x,y)])
  	parts.push(not(nblack(x, y)))}}

  // a field is either white, black or "black with a digit"
  for (var x of xs) {
    for (var y of xs) {
      // parts.push(
      // 	onlyOne([white(x,y),
      // 		 black(x,y),
      // 		 nblack(x,y)]))
      parts.push(implies(white(x,y), not(black(x,y))));
      parts.push(implies(white(x,y), not(nblack(x,y))));
      parts.push(implies(white(x,y), not(xblack(x,y))));

      parts.push(implies(nblack(x,y), not(black(x,y))));
      parts.push(implies(nblack(x,y), not(white(x,y))));

      parts.push(implies(black(x,y), not(nblack(x,y))));
      parts.push(implies(black(x,y), not(white(x,y))));
      // parts.push(implies(black(x,y), not(numfield(x,y))));
      
      parts.push(implies(black(x,y), xblack(x,y)))
      parts.push(implies(nblack(x,y), xblack(x,y)))
      parts.push(implies(white(x,y), numfield(x,y)))
      parts.push(implies(nblack(x,y), numfield(x,y)))

      // parts.push(implies(black(x,y), not(numfield(x,y))))

      // parts.push(eq(xblack(x,y),
      // 		    or(black(x,y), nblack(x,y))))
      // parts.push(eq(numfield(x,y),
      // 		    or(white(x,y), nblack(x,y))))
    }}
  
  // for (var x of xs) {
  //   for (var d of xs) {
  //     var col = []
  //     for (y of xs)
  // 	col.push(implies(numfield(x,y), num(d,x,y)))
  //     parts.push(atMostOne(col))}}

  // for (var y of xs) {
  //   for (var d of xs) {
  //     var row = []
  //     for (var x of xs)
  // 	row.push(implies(numfield(x,y), num(d,x,y)))
  //     parts.push(atMostOne(row))}}

  for (var y of xs) {
    for (var x of xs) {
      var digits = []
      for (var d of xs)
	digits.push(num(d,x,y))

      // parts.push(implies(numfield(x,y), onlyOne(digits)))
      parts.push(implies(numfield(x,y), onlyOne(digits)))
      parts.push(implies(black(x,y)), not(or(digits)))
      // parts.push(implies(black(x,y), not(ors(digits))))

      //// for (var di of digits) {
      //// 	parts.push(implies(di, numfield(x,y)))
      //// 	// parts.push(implies(black(x,y), not(di)))
      //// }

      //// ???parts.push(implies(black(x,y), not(ors(digits))))

      // parts.push(implies(ors(digits), numfield(x,y)))
      
      // for (var d of xs) {
      // 	// parts.push(implies(black(x,y),
      //  	// 		   not(num(d,x,y))))
      // 	parts.push(implies(black(x,y),
      //  			   not(num(d,x,y))))
      // }
      // // parts.push(not(ors(digits)), black(x,y))
    }}

  //////// function fieldInRangeIncl(x, y, da, dz) {
  ////////   var parts = [];
  ////////   for (var d = da; d <= dz; d+=1)
  ////////     parts.push(num(d,x,y))
  ////////   return ors(parts)}

  //////// for (var x of xs) {
  ////////   for (var y of xs) {
  ////////     // (x,y) is the upper end of a vertical street,
  ////////     // this means (x,y-1) is a black field or off bord.
  ////////     for (var yy of xs) {
  //////// 	if (yy >= y+1) {
  //////// 	  // (x,yy) is the lower end of a street,
  //////// 	  // this means (x,yy+1) is a black field or off bord.
  //////// 	  var condParts = [];
  //////// 	  if (y-1 >= 0)
  //////// 	    condParts.push(xblack(x, y-1))
  //////// 	  if (yy+1 < size)
  //////// 	    condParts.push(xblack(x, yy+1))
  //////// 	  for (var cy = y; cy <= yy; cy+=1)
  //////// 	    condParts.push(white(x, cy))
	  
  //////// 	  var len = yy - y + 1;
  //////// 	  if (opts.straightMaxLength
  //////// 	      && len > opts.straightMaxLength) {
  //////// 	    parts.push(not(ands(condParts)))
  //////// 	    continue}
  //////// 	  var implParts = [];
  //////// 	  // d1 is the lowest digit assigned to that straight
  //////// 	  for (var d1 of xs) {
  //////// 	    // some d1's are too high, not enough digits
  //////// 	    if (d1 <= size-len) {
  //////// 	      var dp = [];
  //////// 	      for (var ty = y; ty <= yy; ty+=1)
  //////// 		dp.push(fieldInRangeIncl(x, ty, d1, d1+len-1))
  //////// 	      implParts.push(ands(dp))}}
  //////// 	  parts.push(
  //////// 	    implies(ands(condParts),
  //////// 		    ors(implParts)))}}}}

  //////// // and the same for horizontal straights
  //////// for (var x of xs) {
  ////////   for (var y of xs) {
  ////////     for (var xx of xs) {
  //////// 	if (xx >= x+1) {
  //////// 	  var condParts = [];
  //////// 	  if (x-1 >= 0)
  //////// 	    condParts.push(xblack(x-1, y))
  //////// 	  if (xx+1 < size)
  //////// 	    condParts.push(xblack(xx+1, y))
  //////// 	  for (var cx = x; cx <= xx; cx+=1)
  //////// 	    condParts.push(white(cx, y))
	  
  //////// 	  var len = xx - x + 1;
  //////// 	  if (opts.straightMaxLength
  //////// 	      && len > opts.straightMaxLength) {
  //////// 	    parts.push(not(ands(condParts)))
  //////// 	    continue}
	  
  //////// 	  var implParts = [];
  //////// 	  // d1 is the lowest digit assigned to that straight
  //////// 	  for (var d1 of xs) {
  //////// 	    // some d1's are too high, not enough digits
  //////// 	    if (d1 <= size-len) {
  //////// 	      var dp = [];
  //////// 	      for (var tx = x; tx <= xx; tx+=1)
  //////// 		dp.push(fieldInRangeIncl(tx, y, d1, d1+len-1))
  //////// 	      implParts.push(ands(dp))}}
  //////// 	  parts.push(
  //////// 	    implies(ands(condParts),
  //////// 		    ors(implParts)))}}}}
  
  //////// // force one, two or three black fields in every row and every column
  //////// for (var x of xs) {
  ////////   var bls = []
  ////////   for (var y of xs)
  ////////     bls.push(xblack(x,y))

  ////////   // only 0 and 1 implemented
  ////////   if (opts.minNumBlacksPerLine == 1)
  ////////     parts.push(ors(bls))
  ////////   else assert(opts.minNumBlacksPerLine == 0);

  ////////   // only 1, 2 and 3 implemented
  ////////   if (opts.maxNumBlacksPerLine == 3) {
  ////////     parts.push(atMostThree(bls))}
  ////////   else if (opts.maxNumBlacksPerLine == 2) {
  ////////     parts.push(atMostTwo(bls))}
  ////////   else if (opts.maxNumBlacksPerLine == 1) {
  ////////     parts.push(atMostOne(bls))}
  ////////   else assert(false)}

  //////// for (var y of xs) {
  ////////   var bls = []
  ////////   for (var x of xs)
  ////////     bls.push(xblack(x,y))

  ////////   // only 0 and 1 implemented
  ////////   if (opts.minNumBlacksPerLine == 1)
  ////////     parts.push(ors(bls))
  ////////   else assert(opts.minNumBlacksPerLine == 0);

  ////////   // only 1, 2 and 3 implemented
  ////////   if (opts.maxNumBlacksPerLine == 3) {
  ////////     parts.push(atMostThree(bls))}
  ////////   else if (opts.maxNumBlacksPerLine == 2) {
  ////////     parts.push(atMostTwo(bls))}
  ////////   else if (opts.maxNumBlacksPerLine == 1) {
  ////////     parts.push(atMostOne(bls))}
  ////////   else assert(false)}

  //////// // force blacks to rotational symmetry
  //////// for (var x of xs) {
  ////////   if (x < size/2) {
  ////////     for (var y of xs) {
  //////// 	parts.push(equ(xblack(x,y),
  //////// 		       xblack(size-x-1, size-y-1)))}}}
  
  //////// if (opts.noSingleWhiteCells) {
  ////////   for (var y of xs) {
  ////////     for (var x of xs) {
  //////// 	var blacksAround = []
  //////// 	blacksAround.push(white(x,y))
  //////// 	if (x-1 >= 0)
  //////// 	  blacksAround.push(xblack(x-1, y))
  //////// 	if (y-1 >= 0)
  //////// 	  blacksAround.push(xblack(x, y-1))
  //////// 	if (x+1 < size)
  //////// 	  blacksAround.push(xblack(x+1, y))
  //////// 	if (y+1 < size)
  //////// 	  blacksAround.push(xblack(x, y+1))
  //////// 	parts.push(not(ands(blacksAround)))}}}

  //////// if (opts.noBlackFieldAlone) {
  ////////   var s2 = Math.floor(size/2)
  ////////   for (var y of xs) {
  ////////     for (var x of xs) {
  //////// 	if (y == s2 && x == s2)
  //////// 	  continue
  //////// 	var blacksAround = []
  //////// 	blacksAround.push(xblack(x,y))
  //////// 	if (x-1 >= 0)
  //////// 	  blacksAround.push(not(xblack(x-1, y)))
  //////// 	if (y-1 >= 0)
  //////// 	  blacksAround.push(not(xblack(x, y-1)))
  //////// 	if (x+1 < size)
  //////// 	  blacksAround.push(not(xblack(x+1, y)))
  //////// 	if (y+1 < size)
  //////// 	  blacksAround.push(not(xblack(x, y+1)))
  //////// 	parts.push(not(ands(blacksAround)))}}}

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

function tryGetTwoAssignments(dimacs, interestingLiterals, cont) {
  solveWithMinisat(
    dimacs,
    function (assignment) {
      if (assignment === unsatisfied)
	cont(unsatisfied)
      else {
	var dimacs2 =
	    dimacsAddClause(dimacs,
			    interestingLiterals(assignment)
			    .map(function (l) {return -l}))
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

  var ch = child_process.spawn('minisat', [filename, 'output'])
  ch.on('error',
	function (e) {
	  console.log(e)})
  ch.stdout.on('data', function (data) {
    /*console.log(data.toString())*/})
  ch.stderr.on('data', function (data) {
    console.log('ERR:', data.toString())})
  ch.on('close', function (data) {
    var res = fs.readFileSync('output', {encoding: 'utf8'});
    var lines = res.split('\n')
    if (lines[0] == 'SAT') {
      var as1 = lines[1].split(' ');
      var as2 = as1.map(function (l) {return parseInt(l, 10)})
      var as3 = as2.filter(function (l) {return l !== 0})
      cont(as3)}
    else
      cont(unsatisfied)})}

// function showCurrentState(size, digits, blacks, nblacks,
// 			  assignments, dimacs) {
//   var dig = {}
//   function key(col,row) { return 'c' + col + 'r' + row}
//   for (var d of digits) {
//     dig[key(d.col, d.row)] = d.digit}
//   var pos = {}
//   for (var a of assignments) {
//     if (a > 0) {
//       var v = dimacs.indexToName.get(Math.abs(a));
//       pos[v] = 1}}

//   for (var y = 0; y < size; y+=1) {
//     var parts = []
//     for (var x = 0; x < size; x+=1) {
//       var bla = pos[black(x,y)]
//       var nbla = pos[nblack(x,y)]
//       var d = dig[key(x,y)];
//       var dq = typeof d === 'number';
//       parts.push( (nbla ? 'X'
// 		   : bla ? 'x'
// 		   : ' ')
// 		  + (dq ? '' + (d+1) : '_'))}
//     console.log(parts.join(' '))}}

function showCurrentState(size, digits, blacks, nblacks,
			  assignments, dimacs)
{
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
  
  function isXBlack(x, y) {
    return tr[xblack(x,y)]||0}
  function isBlack(x, y) {
    return tr[black(x,y)]||0}
  function isNBlack(x, y) {
    return tr[nblack(x,y)]||0}
  function isShown(x, y) {
    return typeof dig[key(x,y)] === 'number'}
  function digitAt(x,y) {
    for (var d = 0; d < size; d+=1) {
      if (tr[num(d, x, y)])
	return d}
    return null}
  
  for (var y = 0; y < size; y++) {
    var parts = []
    for (var x = 0; x < size; x++) {
      var val = 0;

      if (isXBlack(x, y)) {
	if (isNBlack(x,y)) {
	  parts.push('X')}
	else {
	  parts.push('x')}}
      else 
	parts.push(' ')
  
      if (isShown(x, y) || isNBlack(x,y)) {
	var di = digitAt(x, y);
	parts.push(typeof di === 'number' ? 1+di : ' ')}
      else
	parts.push('_')
      parts.push(' ')}
    console.log(parts.join(''))}}


function printSolution(size, dimacs, assignments) {
  var pos = {}
  for (var a of assignments) {
    var v = dimacs.indexToName.get(Math.abs(a));
    pos[v] = a > 0 ? 1 : 0}

  for (var y = 0; y < size; y+=1) {
    var parts = []
    for (var x = 0; x < size; x+=1) {
      var d = null;
      for (var dd = 0; dd < size; dd++) {
	if (pos[num(dd, x, y)]) {
	  // assert(d === null)
	  // console.log('mult digits', [dd, x, y])
	  d = dd}}
      var bla = pos[black(x,y)]
      var nbla = pos[nblack(x,y)]
      parts.push( (nbla ? 'X' : bla ? 'x' : ' ')
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
  
  function isXBlack(x, y) {
    return tr[xblack(x,y)]||0}
  function isBlack(x, y) {
    return tr[black(x,y)]||0}
  function isNBlack(x, y) {
    return tr[nblack(x,y)]||0}
  function isShown(x, y) {
    return typeof dig[key(x,y)] === 'number'}
  function digitAt(x,y) {
    for (var d = 0; d < size; d+=1) {
      if (tr[num(d, x, y)])
	return d}
    return null}
  
  var parts = []
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var val = 0;

      if (isXBlack(x, y)) {
	val += 1}
      
      if (isShown(x, y) || isNBlack(x,y)) {
	val += 2}
      val += 4*digitAt(x, y);
      console.log([d, isBlack(x,y), isNBlack(x,y), isShown(x,y), val])
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

function showAssignmentDiffs(assignments, dimacs) {
  var a = assignments[0];
  var b = assignments[1];
  var as = {}
  for (var n of a)
    as[dimacs.indexToName.get(Math.abs(n))] = n > 0 ? 1 : 0;
  for (var n of b) {
    var nm = dimacs.indexToName.get(Math.abs(n));
    if (as[nm] && n < 0) {
      console.log('true in first: ' + nm)}
    if (!as[nm] && n > 0) {
      console.log('false in first: ' + nm)}}}


function numbersInWhiteFields(size, dimacs) {
  return function (assignment) {
    var tr = {}
    for (var n of assignment) {
      if (n > 0)
	tr[dimacs.indexToName.get(n)] = 1}
    var il = []
    for (var x = 0; x < size; x+=1) {
      for (var y = 0; y < size; y+=1) {
	if (tr[white(x,y)]) {
	  for (var d = 0; d < size; d+=1) {
	    var nv = num(d,x,y);
	    if (tr[nv])
	      il.push(dimacs.nameToIndex.get(nv))}}}}
    return il}}



function search(size, digits0, blacks0, nblacks0) {
  var digits = Array.from(digits0)
  var blacks = Array.from(blacks0)
  var nblacks = Array.from(nblacks0)

  // function key(c,r) { return 'c' + c + 'r' + r}
  // var used = {}
  // for (var y in digits) { used[key(d.col, d.row)] = 1}
  // for (var y in nblack) {
  //   used[key(d.col, d.row)] = 1
  //   used[key(size-d.col-1, size-d.row-1)] = 1}
  // for (var y in blacks) {
  //   used[key(d.col, d.row)] = 1
  //   used[key(size-d.col-1, size-d.row-1)] = 1}

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
  function addBlack() {
    if (Math.random() > 0.4) {
      console.log('placing a black field')
      var rb = randBlackInUpperHalf()
      blacks.push({col: rb[0], row: rb[1],
		   black: 1})}
    else {
      console.log('placing a black field with a digit')
      var col = rand();
      var row = rand();
      nblacks.push({col: col, row: row, nblack: 1, digit: rand()})}}


  function add() {
    var nb = 2*blacks0.length + nblacks0.length;
    if (Math.random() > (nb > 7 ? 0.8 : 0.1)) {
      // randomly place a black field
      addBlack()
    }
    else {
      console.log('placing a digit')
      // randomly place a digit
      digits.push({col: rand(), row: rand(), digit: rand()})}}

  add();
  
  console.log(blacks)
  console.log(nblacks)
  console.log(digits)

  var opts = {
    straightMaxLength: null,
    noSingleWhiteCells: true,
    noBlackFieldAlone: false,
    minNumBlacksPerLine: 0,
    maxNumBlacksPerLine: 2
  }
  var dimacs = encodeToDimacs(size, digits, blacks, nblacks, opts);

  tryGetTwoAssignments(
    dimacs,
    numbersInWhiteFields(size, dimacs),
    function (assignments) {
      if (assignments == unsatisfied) {
	// backtrack to earlier digits/blacks
	console.log('\n\nBACKTRACKING\n\n')

	search(size, digits0, blacks0, nblacks0)}
      else {
	console.log('num assignments: ', assignments.length)
	showCurrentState(size, digits, blacks, nblacks,
			 assignments[0], dimacs)
	console.log('\n')
	
	if (assignments.length == 2) {
	  // showAssignmentDiffs(assignments, dimacs)
	  search(size, digits, blacks, nblacks)}
	else if (assignments.length == 1) {
	  console.log('YAY, found one!')
	  printSolution(size, dimacs, assignments[0])
	  showLink(size, digits, dimacs, assignments[0])
	}
	else {
	  assert(false)}}})}

search(5,
       [],
       [],
       // [{col:1,row:1,black:1},
       // 	{col:2,row:2,black:1},
       // 	{col:1,row:2,black:1}],
       [])
