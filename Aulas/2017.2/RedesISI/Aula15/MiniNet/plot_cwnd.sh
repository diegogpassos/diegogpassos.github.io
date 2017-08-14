#! /bin/bash
gnuplot -persist <<EOF
show timestamp
set title "$1"
set xlabel "time (seconds)"
set ylabel "Segments (cwnd, ssthresh)"
plot "$1" using 1:7 with lp title "cwnd"
EOF
