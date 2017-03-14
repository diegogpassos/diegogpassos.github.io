#!/bin/bash

tc qdisc change dev r1-eth1 handle 10: netem limit $1

