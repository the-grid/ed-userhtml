# ed-userhtml
Ed widget for user html

Widget: edit.html and src/edit.js -- zips html into url of runner

Runner: index.html and src/index.js -- unzips html from url and mounts arbitrary html

## dev

Uses `budo`. Can only livereload one part at a time:
    
    rm dist/edit.js
    npm run buildindex

    npm run devedit

or

    rm dist/index.js
    npm run buildedit

    npm run devindex

& open http://localhost:9966/demo.html

## deploy

    npm version (patch|minor|major)
