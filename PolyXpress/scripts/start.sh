#!/bin/bash
LOGD='./logfiles/'
ML='mongodbLog'
NL='nodeLog'
FT='.txt'

echo Starting Mongodb
mongod &> $LOGD$ML$FT &
sleep 2
echo ...
sleep 2
echo ...
sleep 2
echo ...
sleep 2
echo ...
echo Starting Node.js
node app.js &> $LOGD$NL$FT &
sleep 1
echo ...
sleep 1
echo ...
echo Complete.
