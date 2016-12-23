#!/bin/bash

rm -f extension.zip
pushd extension
zip -r ../extension.zip . -x "*.DS_Store"
popd