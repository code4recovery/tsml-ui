#!/bin/bash

docker run -it --name "rollup-dev" -p 3000:3000 -p 35729:35729 -v $(pwd):/usr/src/apps --rm cigzigwon/rollup:gallium-alpine yarn dev
