#!/bin/bash

rm -f extension.zip
npm run build
pushd extension
zip -r ../extension.zip . -x "*.DS_Store"
popd