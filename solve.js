"use strict";
var assert = require('assert')
var util = require('util')

var sat = require('condensate/sat')
var logic = require('condensate/logic')

var or = logic.or;
var and = logic.and;
var nand = logic.nand;
var not = logic.not;

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


function str8ts(size) {
  function num(d,x,y) { return '' + d + '@' + x + ',' + y }
  function black(x,y) { return 'b@' + x + ',' + y }

  var parts = []
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
	  
	  var len = yy - y + 1;
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
	  
	  var len = xx - x + 1;
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
  
  // force one or two black fields in every row and every column
  for (var x of xs) {
    var bls = []
    for (var y of xs)
      bls.push(black(x,y))
    parts.push(oneOrTwo(bls))}

  for (var y of xs) {
    var bls = []
    for (var x of xs)
      bls.push(black(x,y))
    parts.push(oneOrTwo(bls))}

  // parts.push(black(0,2))
  // parts.push(black(1,2))
  // parts.push(black(2,3))
  
  var all = ands(parts)
  var ts = logic.tseitin(all)
  var dimacs = logic.clausesToDimacs(ts)

  console.log('num clauses:', dimacs.dimacs.length)

  let solver = new sat.sat(dimacs.dimacs)
  solver.searchAllAssignments = true
  solver.maxNumberAssignments = 20
  // solver.allowLearnClauses = 1
  console.log('simplify');
  var res = solver.simplify();
  assert(res !== sat.contradiction)
  console.log('solve');
  res = solver.dpll()
  console.log('solutions')
  for (var solution of solver.solutions) {
    function isTrue(nm) {
      return solution.has(dimacs.nameToIndex.get(nm))}

    for (var y of xs) {
      var row = [];
      for (var x of xs) {
	var digit = null;
	for (var d of xs) {
	  if (isTrue(num(d, x, y)))
	    digit = d+1}
	var bl = isTrue(black(x, y)) ? 'X' : ' '
	row.push(bl + digit)}
      console.log(row.join(' '))}
    console.log('')}
}


str8ts(7)
