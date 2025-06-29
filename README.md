# Codefreeze Board



## Testing locally on iPhone:

### Set up server

In /ui folder, run the following command: `npx http-server -a 0.0.0.0 -p 8080`.
It will start a web server on port 8080, and will allow connections from other ip addresses.

### Check the IP address

run `ifconfig`, and find the following response:

```text
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	options=6460<TSO4,TSO6,CHANNEL_IO,PARTIAL_CSUM,ZEROINVERT_CSUM>
	ether 5c:e9:1e:8d:3b:47
	inet6 fe80::1ca8:992:ea73:cb81%en0 prefixlen 64 secured scopeid 0xf 
	inet 192.168.1.76 netmask 0xffffff00 broadcast 192.168.1.255
	nd6 options=201<PERFORMNUD,DAD>
	media: autoselect
	status: active
```
Check the inet address: 192.168.1.76 

### on iPhone:

go to 192.168.1.76:8080


### other considerations

1. **Handling HTTPS and certificates**:
    - If your app requires HTTPS, you might need to set up a local SSL certificate
    - Tools like [mkcert](https://github.com/FiloSottile/mkcert) can help create locally-trusted development certificates

2. **Debugging on iOS**:
    - Enable Web Inspector on your iPhone: Settings > Safari > Advanced > Web Inspector
    - Connect your iPhone to your Mac via USB
    - Open Safari on your Mac
    - In the Develop menu, you should see your iPhone and can inspect pages

3. **Alternative: Use a service like ngrok**:
    - Install [ngrok](https://ngrok.com/) on your computer
    - Start your local server (e.g., on port 8080)
    - Run ngrok to create a tunnel:
