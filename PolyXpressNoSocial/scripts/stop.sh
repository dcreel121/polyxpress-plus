#!/bin/bash
LOGD='./logfiles/'
FT='.txt'
TS=$(date +%Y%m%d.%M.%S)
ML='mongodbLog'
NL='nodeLog'

echo Stopping Mongodb. 
killall mongod
echo Stopping Node.
killall node
echo Saving logfiles.
mv $LOGD$ML$FT $LOGD$ML$TS$FT
mv $LOGD$NL$FT $LOGD$NL$TS$FT
echo Complete.
