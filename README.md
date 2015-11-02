# undiluted - a STR8TS generator

Generates str8ts puzzles by searching for constellations
that have only one single completion.

Constellations are searched by iteratively adding one digit or black
field a time. Each time it is checked if there are still, at least,
two completions. If there is none it backtracks one step. If there
is only one solution we are finished.

Proposed str8ts are solved by encoding them to a SAT problem,
and then via minisat.

It would be straight forward to add more constraints to the generation
process. Right now it's quite random, except one to three black fields
per row and per column. And the black fields are symmetric.

You need to install `minisat` for the solving and install dependencies with

    npm update

Then generate a str8ts with

    node solve.js

give it around five to ten minutes to generate a 9x9 puzzle.
When finished, it outputs an URL that you can use to play it and
share it :)

Generate your own str8ts, share it with your friends. Let me know which ones you like best.

Have fun
https://twitter.com/markusliedl




## Generation Options

    var opts = {
      straightMaxLength: null,
      noSingleWhiteCells: true,
      noBlackFieldAlone: false,
      minNumBlacksPerLine: 0,
      maxNumBlacksPerLine: 3
    }


* straightMaxLength limits the maximum length of (white) straights
* noSingleWhiteCells avoids constellations where all fields around a white field are black, thus isolating it.
* noBlackFieldAlone is an experiment that forces all black fields to appear at least beside one other black field (except the center field)
* minNumBlacksPerLine, 0 or 1, the minimum number of black fields in each row and column
* maxNumBlacksPerLine, 1, 2 or 3, the maximum number of black fields in each row and column
