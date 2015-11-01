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


some examples:

9x9:
http://malie.github.io/undiluted/play/str8ts.html?p=9nbVW__EaTZ0nGo8rNZKTj75QdMLKdW-Ybl_SlrUTA1AKPpLODEvGkB9WIoGx4qemvq4eF-2oqsYEfd2mc

http://malie.github.io/undiluted/play/str8ts.html?p=9dmkK_JBeJPg91ofl0UU3-c7zAzVbpS7W--sl-_hXWdFrz_zUXKT6405VFxGc4cmHemjgSnqi20XPfd75_


or a smaller 7x7:
http://malie.github.io/undiluted/play/str8ts.html?p=7d0xzdDAjRVm8UkndmBQzelrQDNFpcH3UntoMh63SKiGTX_LWT