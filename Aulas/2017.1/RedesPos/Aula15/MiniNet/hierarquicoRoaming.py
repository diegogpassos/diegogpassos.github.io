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
    fbn_r = net.addHost('FlyByNight', cls=Node, ip='0.0.0.0')
    ru_r = net.addHost('RsUs', cls=Node, ip='0.0.0.0')
    internet_r = net.addHost('Internet', cls=Node, ip='0.0.0.0')
    fbn_r.cmd('sysctl -w net.ipv4.ip_forward=1')
    ru_r.cmd('sysctl -w net.ipv4.ip_forward=1')
    internet_r.cmd('sysctl -w net.ipv4.ip_forward=1')

    info( '*** Adding hosts\n')
    h1 = net.addHost('h1', cls=Host, ip='10.0.0.1', defaultRoute=None)
    h2 = net.addHost('h2', cls=Host, ip='10.0.0.2', defaultRoute=None)
    h3 = net.addHost('h3', cls=Host, ip='10.0.0.2', defaultRoute=None)

    info( '*** Adding links\n')
    TCLink(fbn_r, h1, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(fbn_r, h2, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(ru_r, h3, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(fbn_r, internet_r, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)
    TCLink(ru_r, internet_r, bw=10, delay="15ms", jitter="1ms", loss=0, max_queue_size=100)

    info( '*** Starting network\n')
    net.build()

    info( '*** Configuring addresses\n')
    h1.cmd('ifconfig h1-eth0 200.20.16.1 netmask 255.255.254.0 txqueuelen 1')
    h2.cmd('ifconfig h2-eth0 200.20.18.1 netmask 255.255.254.0 txqueuelen 1')
    h3.cmd('ifconfig h3-eth0 200.20.20.1 netmask 255.255.254.0 txqueuelen 1')
    fbn_r.cmd('ifconfig FlyByNight-eth0 200.20.16.2 netmask 255.255.254.0 txqueuelen 1')
    fbn_r.cmd('ifconfig FlyByNight-eth1 200.20.18.2 netmask 255.255.254.0 txqueuelen 1')
    fbn_r.cmd('ifconfig FlyByNight-eth3 10.0.0.2 netmask 255.255.255.0 txqueuelen 1')
    ru_r.cmd('ifconfig RsUs-eth0 200.20.20.2 netmask 255.255.254.0 txqueuelen 1')
    ru_r.cmd('ifconfig RsUs-eth1 10.0.1.2 netmask 255.255.255.0 txqueuelen 1')
    internet_r.cmd('ifconfig Internet-eth0 10.0.0.1 netmask 255.255.255.0')
    internet_r.cmd('ifconfig Internet-eth1 10.0.1.1 netmask 255.255.255.0')

    info('*** Adding routes\n')
    h1.cmd('route add default gw 200.20.16.2')
    h2.cmd('route add default gw 200.20.18.2')
    h3.cmd('route add default gw 200.20.20.2')
    internet_r.cmd('route add -net 200.20.16.0 netmask 255.255.240.0 gw 10.0.0.2')
    internet_r.cmd('route add -net 200.20.20.0 netmask 255.255.254.0 gw 10.0.1.2')
    internet_r.cmd('route add -net 199.31.0.0 netmask 255.255.0.0 gw 10.0.1.2')

    CLI(net)
    net.stop()

if __name__ == '__main__':
    setLogLevel( 'info' )
    myNetwork()
