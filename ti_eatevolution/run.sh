if [[ "$1" != ""] && ["$2" != "" ]]; then
	appc ti build --platform $1 --log-level debug --target $2 --device-id
else
	echo Please enter platform: ios or android
	read PLATFORM
	echo Please enter the target: simulator-ios/emulator-android or device
	read TARGET
	appc ti build --platform $PLATFORM --log-level debug --target $TARGET --device-id
fi