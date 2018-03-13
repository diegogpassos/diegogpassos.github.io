#!/bin/bash

if [ $# -ne 3 ]
then
	echo "Use: $0 <url> <number_of_pages> <output.pdf>"
	exit 1
fi

command -v nodejs &> /dev/null
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
	NODE_PATH=/usr/lib/node_modules nodejs $(dirname $0)/rasterize3.js "${URL}#${i}" /tmp/pdf-out/${i}.pdf 908 681
	#NODE_PATH=/usr/lib/node_modules nodejs $(dirname $0)/rasterize3.js "${URL}#${i}" /tmp/pdf-out/${i}.pdf 1200 751
done

pdfconcat -o ${OUT} $(eval echo "/tmp/pdf-out/{1..$PAGES}.pdf")

rm -r /tmp/pdf-out
