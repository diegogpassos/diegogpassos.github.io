#!/bin/bash

if [ $# -ne 2 ]
then
	echo "Use: $0 <input> <output>"
	exit
fi

TMP=$(mktemp /tmp/convertXXXX)

pandoc -f html -t markdown $1 -o $TMP

for i in $(cat $TMP | grep '!\[\](' | grep '.svg' | sed 's/.*](\(.*\))/\1/g')
do
	j=${i%%.svg}.png
	inkscape $i -d 200 -e $j
	sed -i 's/\(.*](.*\)\.svg/\1\.png/g' $TMP
done

cat $TMP | sed 's/::: {\.section.*$/---\n/g' | sed 's/:::.*$//g' | sed 's/^\([[:space:]]*-\)   /\1 /g' | awk '/^\\$/{next ;}{print $0}'  | sed 's/\\\./\./g' | pandoc -f markdown -t pptx -o $2

rm -f $TMP

