#!/bin/bash

cat aula.html | sed 's/<img.*src="\(.*\)" style="\(.*\)".*\/>/<object type="image\/svg+xml" data="\1" style="\2"><\/object>/g' > aula2.html

