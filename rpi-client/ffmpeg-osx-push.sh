while true
do
ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "1:none" -vf "transpose=1" -vcodec libx264 -preset ultrafast -tune zerolatency -f mpegts -codec:v mpeg1video -s 480x640 -b:v 500k -bf 0 $1
sleep 1 #reconnect..
done