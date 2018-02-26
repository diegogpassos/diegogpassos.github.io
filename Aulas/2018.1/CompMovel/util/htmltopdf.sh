#!/bin/bash

if [ $# -ne 3 ]
then
	echo "Use: $0 <url> <number_of_pages> <output.pdf>"
	exit 1
fi

command -v phantomjs &> /dev/null
if [ $? -ne 0 ]
then
	echo "This script depends on phantomjs, but it could not be found on your system."
	exit 2
fi

command -v convert &> /dev/null
if [ $? -ne 0 ]
then
	echo "This script depends on ImageMagick (convert, in particular), but it could not be found on your system."
	exit 3
fi

URL=$1
PAGES=$2
OUT=$3

if [[ $URL != "http"* ]]
then
	URL="file://"$(realpath $URL)
fi

mkdir /tmp/pdf-out
for i in $(eval echo "{1..$PAGES}"); do
  #echo "Generating page $i..."
  #phantomjs $(dirname $0)/rasterize.js ${URL}#${i} /tmp/pdf-out/${i}.png "1200px*900px"
  echo $(dirname $0)/rasterize.js ${URL}#${i} /tmp/pdf-out/${i}.png "1200px*900px"
done | xargs -l -P 4 phantomjs

convert $(eval echo "/tmp/pdf-out/{1..$PAGES}.png") ${OUT}
rm -r /tmp/pdf-out
