if [ "$1" != "" ]; then
	appc ti build --platform $1 --log-level debug --device-id
else
	echo Please enter platform: ios or android
	read PLATFORM
	appc ti build --platform $PLATFORM --log-level debug --device-id
fi