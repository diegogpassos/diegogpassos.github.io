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

    info( '*** Adding hosts\n')
    h1 = net.addHost('h1', cls=Host, ip='10.0.0.1', defaultRoute=None)
    h2 = net.addHost('h2', cls=Host, ip='10.0.0.2', defaultRoute=None)

    info( '*** Adding links\n')
    TCLink(h1, r1, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(r1, r2, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(r2, r3, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(r3, r4, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(r4, h2, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)

    info( '*** Starting network\n')
    net.build()

    info( '*** Configuring addresses\n')
    h1.cmd('ifconfig h1-eth0 10.0.0.1 netmask 255.255.255.0 txqueuelen 1')
    r1.cmd('ifconfig r1-eth0 10.0.0.2 netmask 255.255.255.0 txqueuelen 1')
    r1.cmd('ifconfig r1-eth1 10.0.1.1 netmask 255.255.255.0 txqueuelen 1')
    r2.cmd('ifconfig r2-eth0 10.0.1.2 netmask 255.255.255.0 txqueuelen 1')
    r2.cmd('ifconfig r2-eth1 10.0.2.1 netmask 255.255.255.0 txqueuelen 1')
    r3.cmd('ifconfig r3-eth0 10.0.2.2 netmask 255.255.255.0 txqueuelen 1')
    r3.cmd('ifconfig r3-eth1 10.0.3.1 netmask 255.255.255.0 txqueuelen 1')
    r4.cmd('ifconfig r4-eth0 10.0.3.2 netmask 255.255.255.0 txqueuelen 1')
    r4.cmd('ifconfig r4-eth1 10.0.4.1 netmask 255.255.255.0 txqueuelen 1')
    h2.cmd('ifconfig h2-eth0 10.0.4.2 netmask 255.255.255.0 txqueuelen 1')

    info('*** Adding routes\n')
    h1.cmd('route add default gw 10.0.0.2')
    h2.cmd('route add default gw 10.0.4.1')
    r1.cmd('route add -net 10.0.2.0 netmask 255.255.255.0 gw 10.0.1.2')
    r1.cmd('route add -net 10.0.3.0 netmask 255.255.255.0 gw 10.0.1.2')
    r1.cmd('route add -net 10.0.4.0 netmask 255.255.255.0 gw 10.0.1.2')
    r2.cmd('route add -net 10.0.0.0 netmask 255.255.255.0 gw 10.0.1.1')
    r2.cmd('route add -net 10.0.3.0 netmask 255.255.255.0 gw 10.0.2.2')
    r2.cmd('route add -net 10.0.4.0 netmask 255.255.255.0 gw 10.0.2.2')
    r3.cmd('route add -net 10.0.0.0 netmask 255.255.255.0 gw 10.0.2.1')
    r3.cmd('route add -net 10.0.1.0 netmask 255.255.255.0 gw 10.0.2.1')
    r3.cmd('route add -net 10.0.4.0 netmask 255.255.255.0 gw 10.0.3.2')
    r4.cmd('route add -net 10.0.0.0 netmask 255.255.255.0 gw 10.0.3.1')
    r4.cmd('route add -net 10.0.1.0 netmask 255.255.255.0 gw 10.0.3.1')
    r4.cmd('route add -net 10.0.2.0 netmask 255.255.255.0 gw 10.0.3.1')

    info('*** Setting MTU\n')
    r1.cmd('ifconfig r1-eth1 mtu 1000')
    r2.cmd('ifconfig r2-eth0 mtu 1000')
    r2.cmd('ifconfig r2-eth1 mtu 500')
    r3.cmd('ifconfig r3-eth0 mtu 500')
    
    CLI(net)
    net.stop()

if __name__ == '__main__':
    setLogLevel( 'info' )
    myNetwork()
