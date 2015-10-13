#!/bin/bash

OUTPUT_DIR=~/Documents/EatEvolution
ANDROID_OUTPUT_DIR=build/android/bin

mkdir -p $OUTPUT_DIR

#appc ti build --platform ios --build-only --force --log-level info --device-family ios --target dist-appstore --distribution-name "Mauro Piccotti" --pp-uuid d3f15939-2996-465e-92dc-70ca4dd68a67

appc ti build --platform android --build-only --force --log-level info
cp $ANDROID_OUTPUT_DIR"/Eat Evolution.apk" $OUTPUT_DIR"/EatEvolution.apk"
