#!/bin/bash

if !which ffmpeg; then 
	echo "ffmpeg is required. exiting"
	exit 1
fi

FOLDER=${1:""}

FILES=($(ls $1 | sed -e 's|.mp3||'))

for f in ${FILES[@]}; do
	echo "Converting $f.mp3 to .ogg and .wav"
	if ffmpeg -i $f.mp3 $f.ogg $f.wav 1>/dev/null 2>&1; then
		echo "$f.mp3 converted"
	else 
		echo "$f.mp3 failed"
	fi
done


