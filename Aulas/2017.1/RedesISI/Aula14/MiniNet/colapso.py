#!/usr/bin/python

from mininet.net import Mininet
from mininet.node import Controller, RemoteController, OVSController
from mininet.node import CPULimitedHost, Host, Node
from mininet.node import OVSKernelSwitch, UserSwitch
from mininet.node import IVSSwitch
from mininet.cli import CLI
from mininet.log import setLogLevel, info
#from mininet.link import TCLink, Intf
from link import TCLink, Intf
from subprocess import call

def myNetwork():

    net = Mininet( topo=None,
                   build=False,
                   ipBase='10.0.0.0/8')

    info( '*** Adding routers\n')
    r1 = net.addHost('r1', cls=Node, ip='0.0.0.0')
    r2 = net.addHost('r2', cls=Node, ip='0.0.0.0')
    r3 = net.addHost('r3', cls=Node, ip='0.0.0.0')
    r4 = net.addHost('r4', cls=Node, ip='0.0.0.0')
    r1.cmd('sysctl -w net.ipv4.ip_forward=1')
    r2.cmd('sysctl -w net.ipv4.ip_forward=1')
    r3.cmd('sysctl -w net.ipv4.ip_forward=1')
    r4.cmd('sysctl -w net.ipv4.ip_forward=1')
    r1.cmd('sysctl -w net.ipv4.conf.all.rp_filter=0')
    r1.cmd('sysctl -w net.ipv4.conf.default.rp_filter=0')
    r2.cmd('sysctl -w net.ipv4.conf.all.rp_filter=0')
    r2.cmd('sysctl -w net.ipv4.conf.default.rp_filter=0')
    r3.cmd('sysctl -w net.ipv4.conf.all.rp_filter=0')
    r3.cmd('sysctl -w net.ipv4.conf.default.rp_filter=0')
    r4.cmd('sysctl -w net.ipv4.conf.all.rp_filter=0')
    r4.cmd('sysctl -w net.ipv4.conf.default.rp_filter=0')

    info( '*** Adding hosts\n')
    h1 = net.addHost('h1', cls=Host, ip='10.0.0.1', defaultRoute=None)
    h2 = net.addHost('h2', cls=Host, ip='10.0.0.2', defaultRoute=None)
    h3 = net.addHost('h3', cls=Host, ip='10.0.0.3', defaultRoute=None)
    h4 = net.addHost('h4', cls=Host, ip='10.0.0.4', defaultRoute=None)

    info( '*** Adding links\n')
    TCLink(r1, h1, IntfName1="r1-eth0", bw=50, delay="5ms", jitter="1ms", loss=0)
    TCLink(r2, h2, IntfName1="r2-eth0", bw=50, delay="5ms", jitter="1ms", loss=0)
    TCLink(r3, h3, IntfName1="r3-eth0", bw=50, delay="5ms", jitter="1ms", loss=0)
    TCLink(r4, h4, IntfName1="r4-eth0", bw=50, delay="5ms", jitter="1ms", loss=0)
#    TCLink(r1, h1, IntfName1="r1-eth0", bw=50, delay="5ms", jitter="1ms", loss=0, enable_red=True)
#    TCLink(r2, h2, IntfName1="r2-eth0", bw=50, delay="5ms", jitter="1ms", loss=0, enable_red=True)
#    TCLink(r3, h3, IntfName1="r3-eth0", bw=50, delay="5ms", jitter="1ms", loss=0, enable_red=True)
#    TCLink(r4, h4, IntfName1="r4-eth0", bw=50, delay="5ms", jitter="1ms", loss=0, enable_red=True)

    TCLink(r1, r2, IntfName1="r1-eth1", IntfName2="r2-eth1", bw=2, delay="5ms", jitter="1ms", loss=0)
    TCLink(r2, r3, IntfName1="r2-eth2", IntfName2="r3-eth1", bw=2, delay="5ms", jitter="1ms", loss=0)
    TCLink(r3, r4, IntfName1="r3-eth2", IntfName2="r4-eth1", bw=2, delay="5ms", jitter="1ms", loss=0)
    TCLink(r4, r1, IntfName1="r4-eth2", IntfName2="r1-eth2", bw=2, delay="5ms", jitter="1ms", loss=0)

#    TCLink(r1, r2, IntfName1="r1-eth1", IntfName2="r2-eth1", bw=2, delay="5ms", jitter="1ms", loss=0, enable_red=True)
#    TCLink(r2, r3, IntfName1="r2-eth2", IntfName2="r3-eth1", bw=2, delay="5ms", jitter="1ms", loss=0, enable_red=True)
#    TCLink(r3, r4, IntfName1="r3-eth2", IntfName2="r4-eth1", bw=2, delay="5ms", jitter="1ms", loss=0, enable_red=True)
#    TCLink(r4, r1, IntfName1="r4-eth2", IntfName2="r1-eth2", bw=2, delay="5ms", jitter="1ms", loss=0, enable_red=True)

    info( '*** Starting network\n')
    net.build()

    info( '*** Configuring addresses\n')
    r1.cmd('ifconfig r1-eth1 10.1.2.1 netmask 255.255.255.0')
    r1.cmd('ifconfig r1-eth2 10.1.4.1 netmask 255.255.255.0')
    r2.cmd('ifconfig r2-eth1 10.1.2.2 netmask 255.255.255.0')
    r2.cmd('ifconfig r2-eth2 10.2.3.1 netmask 255.255.255.0')
    r3.cmd('ifconfig r3-eth1 10.2.3.2 netmask 255.255.255.0')
    r3.cmd('ifconfig r3-eth2 10.3.4.1 netmask 255.255.255.0')
    r4.cmd('ifconfig r4-eth1 10.3.4.2 netmask 255.255.255.0')
    r4.cmd('ifconfig r4-eth2 10.1.4.2 netmask 255.255.255.0')

    r1.cmd('ifconfig r1-eth0 10.1.0.1 netmask 255.255.255.0')
    r2.cmd('ifconfig r2-eth0 10.2.0.1 netmask 255.255.255.0')
    r3.cmd('ifconfig r3-eth0 10.3.0.1 netmask 255.255.255.0')
    r4.cmd('ifconfig r4-eth0 10.4.0.1 netmask 255.255.255.0')
    h1.cmd('ifconfig h1-eth0 10.1.0.2 netmask 255.255.255.0')
    h2.cmd('ifconfig h2-eth0 10.2.0.2 netmask 255.255.255.0')
    h3.cmd('ifconfig h3-eth0 10.3.0.2 netmask 255.255.255.0')
    h4.cmd('ifconfig h4-eth0 10.4.0.2 netmask 255.255.255.0')

    info('*** Adding routes\n')
    r1.cmd('route add -net 10.2.0.0/16 gw 10.1.2.2')
    r1.cmd('route add -net 10.3.0.0/16 gw 10.1.2.2')
    r1.cmd('route add -net 10.4.0.0/16 gw 10.1.4.2')

    r2.cmd('route add -net 10.1.0.0/16 gw 10.1.2.1')
    r2.cmd('route add -net 10.3.0.0/16 gw 10.2.3.2')
    r2.cmd('route add -net 10.4.0.0/16 gw 10.2.3.2')

    r3.cmd('route add -net 10.1.0.0/16 gw 10.3.4.2')
    r3.cmd('route add -net 10.2.0.0/16 gw 10.2.3.1')
    r3.cmd('route add -net 10.4.0.0/16 gw 10.3.4.2')

    r4.cmd('route add -net 10.1.0.0/16 gw 10.1.4.1')
    r4.cmd('route add -net 10.2.0.0/16 gw 10.1.4.1')
    r4.cmd('route add -net 10.3.0.0/16 gw 10.3.4.1')

    h1.cmd('route add default gw 10.1.0.1')
    h2.cmd('route add default gw 10.2.0.1')
    h3.cmd('route add default gw 10.3.0.1')
    h4.cmd('route add default gw 10.4.0.1')

    info('*** Starting daemons\n')
    h1.cmd('iperf -sD')
    h2.cmd('iperf -sD')
    h3.cmd('iperf -sD')
    h4.cmd('iperf -sD')
    h1.cmd('iperf -suD')
    h2.cmd('iperf -suD')
    h3.cmd('iperf -suD')
    h4.cmd('iperf -suD')

    CLI(net)
    net.stop()

if __name__ == '__main__':
    setLogLevel( 'info' )
    myNetwork()
