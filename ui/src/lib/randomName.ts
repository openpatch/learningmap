const adjectives = [
	'Lucky',
	'Happy',
	'Brave',
	'Swift',
	'Clever',
	'Bright',
	'Quick',
	'Smart',
	'Bold',
	'Wise',
	'Cool',
	'Keen',
	'Noble',
	'Proud',
	'Calm',
	'Jolly',
	'Eager',
	'Gentle',
	'Mighty',
	'Witty'
];

const animals = [
	'Tiger',
	'Eagle',
	'Lion',
	'Bear',
	'Wolf',
	'Fox',
	'Hawk',
	'Owl',
	'Panda',
	'Dolphin',
	'Shark',
	'Falcon',
	'Jaguar',
	'Leopard',
	'Panther',
	'Raven',
	'Phoenix',
	'Dragon',
	'Lynx',
	'Cobra'
];

export function generateRandomName(): string {
	const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
	const animal = animals[Math.floor(Math.random() * animals.length)];
	return `${adjective}${animal}`;
}

export function generateRandomCode(length: number = 6): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}
