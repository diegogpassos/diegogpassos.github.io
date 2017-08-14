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
    r1.cmd('sysctl -w net.ipv4.ip_forward=1')

    info( '*** Adding hosts\n')
    h1 = net.addHost('h1', cls=Host, ip='10.0.0.1', defaultRoute=None)
    h2 = net.addHost('h2', cls=Host, ip='10.0.0.2', defaultRoute=None)
    h3 = net.addHost('h3', cls=Host, ip='10.0.0.3', defaultRoute=None)

    info( '*** Adding links\n')
    TCLink(r1, h1, IntfName1="r1-eth0", bw=50, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(r1, h2, IntfName1="r1-eth1", bw=10, delay="5ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(r1, h3, IntfName1="r1-eth2", bw=50, delay="5ms", jitter="1ms", loss=0, max_queue_size=100)
    #TCLink(r1, h1, IntfName1="r1-eth0", bw=50, delay="15ms", jitter="1ms", loss=0, enable_red=True, max_queue_size=10)
    #TCLink(r1, h2, IntfName1="r1-eth1", bw=10, delay="5ms", jitter="1ms", loss=0, enable_red=True, max_queue_size=10)
    #TCLink(r1, h3, IntfName1="r1-eth2", bw=50, delay="5ms", jitter="1ms", loss=0, enable_red=True, max_queue_size=10)

    info( '*** Starting network\n')
    net.build()

    info( '*** Configuring addresses\n')
    r1.cmd('ifconfig r1-eth0 10.0.1.1 netmask 255.255.255.0 txqueuelen 1')
    r1.cmd('ifconfig r1-eth1 10.0.2.1 netmask 255.255.255.0 txqueuelen 1')
    r1.cmd('ifconfig r1-eth2 10.0.3.1 netmask 255.255.255.0 txqueuelen 1')
    h1.cmd('ifconfig h1-eth0 10.0.1.2 netmask 255.255.255.0 txqueuelen 1')
    h2.cmd('ifconfig h2-eth0 10.0.2.2 netmask 255.255.255.0 txqueuelen 1')
    h3.cmd('ifconfig h3-eth0 10.0.3.2 netmask 255.255.255.0 txqueuelen 1')

    info('*** Adding routes\n')
    h1.cmd('route add default gw 10.0.1.1')
    h2.cmd('route add default gw 10.0.2.1')
    h3.cmd('route add default gw 10.0.3.1')

    info('*** Starting daemons\n')
    h1.cmd('iperf -sD')
    h2.cmd('iperf -sD')
    h3.cmd('iperf -sD')
    h1.cmd('iperf -suD')
    h2.cmd('iperf -suD')
    h3.cmd('iperf -suD')

    CLI(net)
    net.stop()

if __name__ == '__main__':
    setLogLevel( 'info' )
    myNetwork()
