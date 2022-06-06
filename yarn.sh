#!/bin/bash

docker run -it --name yarn -v $(pwd):/usr/src/apps --rm cigzigwon/rollup:gallium-alpine yarn "$@"
