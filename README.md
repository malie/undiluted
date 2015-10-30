# undiluted - a STR8TS solver

Solves str8ts puzzles by encoding to SAT.
Right now it can generate random ones.

Uses condensate to solve the SAT problems, though encoding to
DIMACS format is already happing internally and exporting to a
efficient SAT solver should not be difficult.



## example run

Black fields are the ones with an X.

    node solve.js 
    num clauses: 54117
    simplify
    solve
    solutions
    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  6  4 X1
     2  3  5  1  4  6 X7
     4  1  3  5  2 X7  6
    X7  6 X1  4  3  2  5
     6 X7  2  3  5  1  4

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  6  4 X1
     2  3  5  1  4  6 X7
     4  1  3  5  2 X7  6
     7  6 X1  4  3  2  5
     6 X7  2  3  5  1  4

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  6  4 X1
     2  3  5  1  4  6 X7
     4  1  3  5  2 X7  6
     7 X6 X1  4  3  2  5
     6 X7  2  3  5  1  4

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  4  6 X1
     2  3  5  1  6  4 X7
     4  1  3  5  2 X7  6
     7 X6 X1  4  3  2  5
     6 X7  2  3  5  1  4

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  4  6 X1
     2  3  5  1  6  4 X7
     4  1  3  5  2 X7  6
     7  6 X1  4  3  2  5
     6 X7  2  3  5  1  4

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  4  6 X1
     2  3  5  1  6  4 X7
     4  1  3  5  2 X7  6
    X7  6 X1  4  3  2  5
     6 X7  2  3  5  1  4

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  6  4 X1
     2  3  5  1  4  6 X7
     4  1  3  5  2 X7  6
    X7  6 X1  3  5  2  4
     6 X7  2  4  3  1  5

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  6  4 X1
     2  3  5  1  4  6 X7
     4  1  3  5  2 X7  6
     7 X6 X1  3  5  2  4
     6 X7  2  4  3  1  5

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  6  4 X1
     2  3  5  1  4  6 X7
     4  1  3  5  2 X7  6
     7  6 X1  3  5  2  4
     6 X7  2  4  3  1  5

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  4  6 X1
     2  3  5  1  6  4 X7
     4  1  3  5  2 X7  6
     7  6 X1  3  5  2  4
     6 X7  2  4  3  1  5

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  4  6 X1
     2  3  5  1  6  4 X7
     4  1  3  5  2 X7  6
     7 X6 X1  3  5  2  4
     6 X7  2  4  3  1  5

    X1  2  4  6  7  5  3
     5  4  6 X7 X1  3  2
     3  5  7  2  4  6 X1
     2  3  5  1  6  4 X7
     4  1  3  5  2 X7  6
    X7  6 X1  3  5  2  4
     6 X7  2  4  3  1  5

    X1  2  4  6  5  3 X7
     5  4  6 X7  3  2  1
     3  5  7  4  6 X1  2
     2  3  5  1  4 X7  6
     4  1  3  2 X7  6  5
    X7  6 X1  3  2  5  4
     6 X7  2  5  1  4  3

    X1  2  4  6  5  3  7
     5  4  6 X7  3  2 X1
     3  5  7  4  6 X1  2
     2  3  5  1  4 X7  6
     4  1  3  2 X7  6  5
    X7  6 X1  3  2  5  4
     6 X7  2  5  1  4  3

    X1  2  4  6  5  3 X7
     5  4  6 X7  3  2 X1
     3  5  7  4  6 X1  2
     2  3  5  1  4 X7  6
     4  1  3  2 X7  6  5
    X7  6 X1  3  2  5  4
     6 X7  2  5  1  4  3

    X1  2  4  6  5  3  7
     5  4  6 X7  3  2 X1
     3  5  7  4  6 X1  2
     2  3  5  1  4 X7  6
     4  1  3  2 X7  6  5
     7 X6 X1  3  2  5  4
     6 X7  2  5  1  4  3

    X1  2  4  6  5  3  7
     5  4  6 X7  3  2 X1
     3  5  7  4  6 X1  2
     2  3  5  1  4 X7  6
     4  1  3  2 X7  6  5
     7  6 X1  3  2  5  4
     6 X7  2  5  1  4  3

    X1  2  4  6  5  3 X7
     5  4  6 X7  3  2  1
     3  5  7  4  6 X1  2
     2  3  5  1  4 X7  6
     4  1  3  2 X7  6  5
     7  6 X1  3  2  5  4
     6 X7  2  5  1  4  3

    X1  2  4  6  5  3 X7
     5  4  6 X7  3  2  1
     3  5  7  4  6 X1  2
     2  3  5  1  4 X7  6
     4  1  3  2 X7  6  5
     7 X6 X1  3  2  5  4
     6 X7  2  5  1  4  3

     1  2  4  6  5  3 X7
     5  4  6 X7  3  2  1
     3  5  7  4  6 X1  2
     2  3  5  1  4 X7  6
     4  1  3  2 X7  6  5
    X7  6 X1  3  2  5  4
     6 X7  2  5  1  4  3
