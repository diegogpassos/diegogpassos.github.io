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

    info('*** Adding switches\n')
    s1 = net.addSwitch('s1', cls=OVSKernelSwitch, failMode='standalone' )

    info( '*** Adding routers\n')
    r1 = net.addHost('r1', cls=Node, ip='0.0.0.0')
    r1.cmd('sysctl -w net.ipv4.ip_forward=1')

    info( '*** Adding hosts\n')
    h1 = net.addHost('h1', cls=Host, defaultRoute=None)
    h2 = net.addHost('h2', cls=Host, defaultRoute=None)
    h3 = net.addHost('h3', cls=Host, defaultRoute=None)
    server = net.addHost('server', cls=Host, defaultRoute=None)

    info( '*** Adding links\n')
    TCLink(h1, s1, bw=10, delay="15ms", jitter="1ms", loss=0)
    TCLink(h2, s1, bw=10, delay="15ms", jitter="1ms", loss=0)
    TCLink(h3, s1, bw=10, delay="15ms", jitter="1ms", loss=0)
    TCLink(r1, s1, bw=10, delay="15ms", jitter="1ms", loss=0)
    TCLink(r1, server, bw=10, delay="15ms", jitter="1ms", loss=0)

    info( '*** Starting network\n')
    net.build()

    info( '*** Configuring addresses\n')
    h1.cmd('ifconfig h1-eth0 10.0.0.1 netmask 255.255.255.0')
    h2.cmd('ifconfig h2-eth0 10.0.0.2 netmask 255.255.255.0')
    h3.cmd('ifconfig h3-eth0 10.0.0.3 netmask 255.255.255.0')
    r1.cmd('ifconfig r1-eth0 10.0.0.4 netmask 255.255.255.0')
    r1.cmd('ifconfig r1-eth1 138.76.29.7 netmask 255.255.255.0')
    server.cmd('ifconfig server-eth0 138.76.29.100 netmask 255.255.255.0')

    info('*** Adding routes\n')
    h1.cmd('route add default gw 10.0.0.4')
    h2.cmd('route add default gw 10.0.0.4')
    h3.cmd('route add default gw 10.0.0.4')

    info('*** Configuring NAT\n')
    r1.cmd('iptables -t nat -A POSTROUTING -o r1-eth1 -j MASQUERADE')

    info( '*** Starting switches\n')
    net.get('s1').start([])

    CLI(net)
    net.stop()

if __name__ == '__main__':
    setLogLevel( 'info' )
    myNetwork()
