# The platform: ios or android
PLATFORM=$1
if [ "$PLATFORM" == "" ]; then
	PLATFORM="android"
fi

# The target: device, simulator (ios) or emulator (android)
TARGET=$2
if [ "$TARGET" == "" ]; then
	TARGET="device"
fi

# Y for choosing destination, N for the default
CHOICE=$3
if [ "$CHOICE" == "" ]; then
	CHOICE="N"
fi

if [ "$CHOICE" == "Y" ]; then
	appc ti build --platform $PLATFORM --log-level debug --target $TARGET --device-id
else
	appc ti build --platform $PLATFORM --log-level debug --target $TARGET
fi
