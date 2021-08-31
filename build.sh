#!/bin/bash

docker run -it --name yarn -v $(pwd):/usr/src/apps --rm cigzigwon/yarn:fermium-alpine yarn prod
