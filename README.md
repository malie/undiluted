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
per row and per column. And the black fields are symmetric

Once you got it running with

    node solve.js

give it around five to ten minutes to generate a 9x9 puzzle.
When finished, it outputs an URL that you can use to play it and
share it :)

Have fun
https://twitter.com/markusliedl
