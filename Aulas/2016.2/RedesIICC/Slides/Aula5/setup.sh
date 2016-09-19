#!/bin/bash

IFNAME=$(ifconfig -a | grep enx | cut -f 1 -d " ")
/etc/init.d/network-manager stop
ifconfig enp1s0 10.0.0.2 netmask 255.255.255.0
ifconfig enp1s0:0 192.168.2.10 netmask 255.255.255.0
ifconfig enp1s0:1 10.2.0.2 netmask 255.255.255.0
ifconfig $IFNAME 10.1.0.2 netmask 255.255.255.0


