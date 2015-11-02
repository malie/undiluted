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




## some examples:

9x9:
http://malie.github.io/undiluted/play/str8ts.html?p=9nbVW__EaTZ0nGo8rNZKTj75QdMLKdW-Ybl_SlrUTA1AKPpLODEvGkB9WIoGx4qemvq4eF-2oqsYEfd2mc
http://malie.github.io/undiluted/play/str8ts.html?p=9dmkK_JBeJPg91ofl0UU3-c7zAzVbpS7W--sl-_hXWdFrz_zUXKT6405VFxGc4cmHemjgSnqi20XPfd75_
http://malie.github.io/undiluted/play/str8ts.html?p=9-qMHfQsiFSr51it28Dwv380JSW5e8k7Ktr8GKddNVfvMOnxKzEvIH7jEDxnGo8ieujd8Wr7d8mCwWypto
http://malie.github.io/undiluted/play/str8ts.html?p=9wqxY-wBmTxR5E6aj8ByO13ekKzBrtGnMiItY7bUDL5AGDdWP8STO6spBLUnZqd4a4i28H-Bs06FIYt2bN
http://malie.github.io/undiluted/play/str8ts.html?p=900xKf-KaVA1n3qa5qXwEcjtzJy6p_Stb9ftu3ntBTdXqVtWuBFD6lk6mOHCvrr8emWoeWlhdKgMRYde9h
http://malie.github.io/undiluted/play/str8ts.html?p=9s4JW69X0PORjQor6fVGXNknZSGwj7PgUrlcltfhJnbVyPoXyJyC5oquQLNSO4s4mndlqTdBt8sZhJ3_hh
http://malie.github.io/undiluted/play/str8ts.html?p=9-kPbtSBnMUl0Igpw8FwC1naJM1AM3urQackK113MnoxMHtHPKGXE8BopLVzxsh4emZhiXe7hffzQUyib8
http://malie.github.io/undiluted/play/str8ts.html?p=9-jiYrOB8WSl1HeGl8DuE1-eRbWM3IS6Ijg8Ig9dPXfFG4rHH9MIId8oGOBnx67mIm2oiG1bhb0NyUl7Uk
http://malie.github.io/undiluted/play/str8ts.html?p=9dfNzCOFsHQgCQgapaUC11hrJvvJatujwK7oQ7bobzjOOvhFOCyzw2BhBGRWBiw4Jak_mXogpe4BQDgA8c
http://malie.github.io/undiluted/play/str8ts.html?p=9b6BP1Gs4uIarWd52kkUM-JjVFDAd_YaOMngALijzH7ZHxhtOGGAEpa2BiFWTqpq98tjVvlojn0Iyw6oV_

or a smaller 7x7:
http://malie.github.io/undiluted/play/str8ts.html?p=7d0xzdDAjRVm8UkndmBQzelrQDNFpcH3UntoMh63SKiGTX_LWT


or the 5x5:
http://malie.github.io/undiluted/play/str8ts.html?p=5dmAHdDJ_SQ75y_a7fZuLn_8Bw
http://malie.github.io/undiluted/play/str8ts.html?p=5hqQD3DI8PUf1McadiZHLncaBw
http://malie.github.io/undiluted/play/str8ts.html?p=5ffZC7uN0ZJonx_92iBuCj75AG
http://malie.github.io/undiluted/play/str8ts.html?p=53iZX5TZ8TQs5L097oRuLrsbZG
http://malie.github.io/undiluted/play/str8ts.html?p=57eBy5EV9JRn1A0qgqYEunt-VC
http://malie.github.io/undiluted/play/str8ts.html?p=5-gNxmII7PM75E4cdoAJyg_5By
http://malie.github.io/undiluted/play/str8ts.html?p=5-qBD_HY8HQ61wc-biZHLeqdZu



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
