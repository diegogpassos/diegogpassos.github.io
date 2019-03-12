#!/bin/bash

FILE=$1
cp $FILE /tmp/$FILE


#OPTS=$(inkscape --query-all $FILE -z | grep text | awk -F ',' '{printf "--select %s --verb SelectionTextRemoveKerns ", $1}')
#echo "/tmp/$FILE $OPTS --verb FileSave --verb FileClose" | inkscape --shell
#inkscape $OPTS --verb FileSave --verb FileClose /tmp/$FILE -z

cat /tmp/$FILE | perl -pe  's|font-family:.*?;|font-family: Lora;|g' | perl -pe  's|font-family=".*?"|font-family="Lora"|g' | awk -F '"' '
BEGIN{

	OFS = "\"";
}
/<tspan/{

	while(1) {

		if ($0 ~ /x=/) {

			nComp = split($2, a, " ");
			$2 = a[1];
		}
		print $0;
		if ($0 ~ />/) break ;
		getline ;
	}
	next ;
}

{
	print $0;
}
' > $FILE

