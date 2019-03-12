#!/bin/bash

FILE=$1
cp $FILE /tmp/$FILE


#OPTS=$(inkscape --query-all $FILE -z | grep text | awk -F ',' '{printf "--select %s --verb SelectionTextRemoveKerns ", $1}')
#echo "/tmp/$FILE $OPTS --verb FileSave --verb FileClose" | inkscape --shell
#inkscape $OPTS --verb FileSave --verb FileClose /tmp/$FILE -z

cat /tmp/$FILE | perl -pe  's|font-family:.*?;|font-family: Lora;|g' | perl -pe  's|font-family=".*?"|font-family="Lora"|g' | awk -F '"' '
BEGIN{
	OFS="\"";
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
/<svg.*>/{

	for (i = 1; i <= NF; i++) {

		if ($(i) ~ /height/) {
			
			h = $(i+1) + 0;
		}
		else if ($(i) ~ /width/) {
			
			w = $(i+1) + 0;
		}
		else if ($(i) ~ /viewBox/) {

			print $0;
			next;
		}
	}
	$(NF) = " viewBox=\"0 0 " w " " h "\">";
	print $0;
	next ;
}
/<svg/{
	inSVG = 1;
}
(/height=/ && inSVG == 1){

	h = $2 + 0;
}
(/width=/ && inSVG == 1){

	w = $2 + 0;
}
(/viewBox=/ && inSVG == 1){
	viewBox = 1;
}
(/>/ && inSVG == 1){

	inSVG = 0;
	if (viewBox != 1) 
		printf "viewBox=\"0 0 %f %f\"\n", w, h;
}
/<defs/{
	printf "<defs><style type=\"text/css\">@import url(https://fonts.googleapis.com/css?family=Lora:400,400italic,700,700italic)</style></defs>\n"
} 

{
	print $0
}
' > $FILE

