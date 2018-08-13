#!/bin/bash

vconfig add enp1s0 2
vconfig add enp1s0 3
ifconfig enp1s0 10.0.0.2 netmask 255.255.255.0
ifconfig enp1s0.2 10.0.2.2 netmask 255.255.255.0
ifconfig enp1s0.3 10.0.3.2 netmask 255.255.255.0
ifconfig enp1s0:0 192.168.0.2 netmask 255.255.255.0
ifconfig enx0014d110fccb 192.168.2.2 netmask 255.255.255.0

