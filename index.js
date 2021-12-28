const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const msmc = require('msmc');
const fetch = require('node-fetch');
const fs = require('fs');

const accounts = require('./JSON/accounts.json');
const instance = require('./instance.json');

//msmc's testing enviroment sometimes runs into this issue that it can't load node fetch
msmc.setFetch(fetch);

if (accounts.acc[accounts.active] == null || accounts.acc[accounts.active] == undefined) {
	msmc
		.fastLaunch('raw', (update) => {
			//A hook for catching loading bar events and errors, standard with MSMC
			console.log(update);
		})
		.then((result) => {
			//Let's check if we logged in?
			if (msmc.errorCheck(result)) {
				console.log(result.reason);
				return;
			}

			accounts.acc[accounts.active] = msmc.getMCLC().getAuth(result);

			fs.writeFileSync('./JSON/accounts.json', JSON.stringify(accounts, null, '\t'));

			launch(accounts.acc[accounts.active], instance.version, instance.memory);
		})
		.catch((reason) => {
			//If the login fails
			console.log('We failed to log someone in because : ' + reason);
		});
} else {
	launch(accounts.acc[accounts.active], instance.version, instance.memory);
}

function launch(account, ver, mem) {
	let opts = {
		clientPackage: null,
		// Pulled from the Minecraft Launcher core docs , this function is the star of the show
		authorization: account,
		root: `${
			process.env.APPDATA ||
			(process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share')
		}/.minecraft`,
		version: ver,
		memory: mem,
		overrides: {
			detached: false,
		},
	};
	console.log('Starting!');
	launcher.launch(opts);

	launcher.on('debug', (e) => console.log(`[DEBUG] ${e}`));
	launcher.on('data', (e) => console.log(`[DATA] ${e}`));
}
