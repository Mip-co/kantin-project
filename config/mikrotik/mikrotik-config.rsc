# 2026-07-10 14:35:44 by RouterOS 7.21.4
# system id = yL7+Z6KJcWL
#
/interface ethernet
set [ find default-name=ether2 ] disable-running-check=no name=DMZ
set [ find default-name=ether3 ] disable-running-check=no name=LAN
set [ find default-name=ether1 ] disable-running-check=no name=WAN
/ip address
add address=7.7.7.1/30 interface=DMZ network=7.7.7.0
add address=192.168.56.1/24 interface=LAN network=192.168.56.0
/ip dhcp-client
add interface=WAN
/ip firewall filter
add action=accept chain=forward comment=Established/Related connection-state=\
    established,related
add action=drop chain=forward comment="Drop Invalid" connection-state=invalid
add action=accept chain=forward comment="Allow HTTP to Nginx" dst-address=\
    7.7.7.2 dst-port=80 protocol=tcp
add action=accept chain=forward comment="Allow Ping" protocol=icmp
add action=drop chain=forward comment="Block App1" dst-address=7.7.7.2 \
    dst-port=3001 protocol=tcp
add action=drop chain=forward comment="Block App2" dst-address=7.7.7.2 \
    dst-port=3002 protocol=tcp
add action=drop chain=forward comment="Block MySQL except DMZ" dst-address=\
    192.168.56.2 dst-port=3306 protocol=tcp src-address=!7.7.7.0/30
add action=accept chain=forward comment="Allow DNS TCP from DMZ" dst-port=53 \
    protocol=tcp src-address=7.7.7.2
add action=accept chain=forward comment="Allow DNS UDP from DMZ" dst-port=53 \
    protocol=udp src-address=7.7.7.2
add action=accept chain=forward comment="Allow HTTP Internet" dst-port=80 \
    protocol=tcp src-address=7.7.7.2
add action=accept chain=forward comment="Allow HTTPS Internet" dst-port=443 \
    protocol=tcp src-address=7.7.7.2
add action=accept chain=forward comment="Allow DMZ to MySQL" dst-address=\
    192.168.56.2 dst-port=3306 protocol=tcp src-address=7.7.7.2
add action=drop chain=forward comment="Drop Others"
/ip firewall nat
add action=masquerade chain=srcnat out-interface=WAN
add action=dst-nat chain=dstnat comment="HTTP ke Nginx" dst-port=80 \
    in-interface=WAN protocol=tcp to-addresses=7.7.7.2 to-ports=80
