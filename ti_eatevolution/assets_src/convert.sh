#!/bin/bash

rm -rf ../app/assets/iphone/images
mkdir ../app/assets/iphone/images

cd ios
for image_file in *.png
do
	filename=`echo $image_file|sed 's/\.png$//g'`
	
	#TODO bisognerebbe portare tutte le icone alla dimensione 3x e ridurle poi alle risoluzioni minori
	cp $image_file "../../app/assets/iphone/images/"$filename"@2x.png"
	convert $image_file -resize "50%x50%" "../../app/assets/iphone/images/"$image_file
	convert $image_file -resize "150%x150%" "../../app/assets/iphone/images/"$filename"@3x.png"
done
cd ..

rm -rf ../app/assets/android/images
mkdir ../app/assets/android/images
mkdir ../app/assets/android/images/res-xxhdpi
mkdir ../app/assets/android/images/res-xhdpi
mkdir ../app/assets/android/images/res-hdpi
mkdir ../app/assets/android/images/res-mdpi
mkdir ../app/assets/android/images/res-ldpi

cd android
for image_file in *.png
do
	filename=`echo $image_file|sed 's/\.png$//g'`
	
	cp $image_file "../../app/assets/android/images/res-xxhdpi/"$image_file
	convert $image_file -resize "67%x67%" "../../app/assets/android/images/res-xhdpi/"$image_file
	convert $image_file -resize "50%x50%" "../../app/assets/android/images/res-hdpi/"$image_file
	convert $image_file -resize "33%x33%" "../../app/assets/android/images/res-mdpi/"$image_file
	convert $image_file -resize "25%x25%" "../../app/assets/android/images/res-ldpi/"$image_file
done
cd ..