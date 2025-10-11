import QRCode from 'qrcode';

export async function generateQRCode(text: string): Promise<string> {
	try {
		return await QRCode.toDataURL(text, {
			width: 300,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#FFFFFF'
			}
		});
	} catch (err) {
		console.error('Error generating QR code:', err);
		throw err;
	}
}

export async function generateQRCodeSVG(text: string): Promise<string> {
	try {
		return await QRCode.toString(text, {
			type: 'svg',
			width: 300,
			margin: 2
		});
	} catch (err) {
		console.error('Error generating QR code SVG:', err);
		throw err;
	}
}
