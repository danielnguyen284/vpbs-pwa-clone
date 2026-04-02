const fetch = require('node-fetch');
fetch('https://histdatafeed.vps.com.vn/tradingview/history?symbol=VHM&resolution=D&from=1711929600&to=1722102400')
	.then(res => res.json())
	.then(data => {
		console.log(data);
	})
	.catch(console.error);
