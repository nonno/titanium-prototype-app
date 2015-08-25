#!/bin/bash

#creazione delle cartelle necessarie
mkdir -p ../app/assets/iphone/images
# mkdir -p ../app/assets/android/images/res-xxhdpi #prova
mkdir -p ../app/assets/android/images/res-xhdpi #prova
mkdir -p ../app/assets/android/images/res-hdpi
mkdir -p ../app/assets/android/images/res-mdpi
mkdir -p ../app/assets/android/images/res-ldpi

for image_file in *.png
do
    filename=`echo $image_file|sed 's/\.png$//g'`
    cp $image_file "../app/assets/iphone/images/"$filename"@2x.png"
    # convert $image_file -resize "150%x150%" "../app/assets/android/images/res-xxhdpi/"$image_file #prova
    # cp $image_file "../app/assets/android/images/res-xxhdpi/" #prova
    cp $image_file "../app/assets/android/images/res-xhdpi/" #prova
    convert $image_file -resize "50%x50%" "../app/assets/iphone/images/"$image_file
    convert $image_file -resize "75%x75%" "../app/assets/android/images/res-hdpi/"$image_file
    convert $image_file -resize "50%x50%" "../app/assets/android/images/res-mdpi/"$image_file
    convert $image_file -resize "37.5%x37.5%" "../app/assets/android/images/res-ldpi/"$image_file
done
