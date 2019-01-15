#!/bin/bash

rm -f extension.zip
npm run lint
npm run build
pushd extension
zip -r ../extension.zip . -x "*.DS_Store"
popd