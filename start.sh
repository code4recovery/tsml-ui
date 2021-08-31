#!/bin/bash

docker run -it -p 3000:3000 -v $(pwd):/usr/src/apps --rm cigzigwon/yarn:fermium-alpine yarn dev
