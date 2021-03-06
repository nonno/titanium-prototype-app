#!/bin/bash

OUTPUT_DIR=~/Documents/EatEvolution
ANDROID_OUTPUT_DIR=build/android/bin

mkdir -p $OUTPUT_DIR

appc ti build --platform android --build-only --force --log-level info
cp $ANDROID_OUTPUT_DIR"/Eat Evolution.apk" $OUTPUT_DIR"/EatEvolution.apk"
