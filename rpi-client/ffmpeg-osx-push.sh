while true
do
ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "1:none" -vcodec libx264 -preset ultrafast -tune zerolatency -f mpegts -codec:v mpeg1video -s 640x480 -b:v 1000k -bf 0 $1
sleep 1 #reconnect..
done