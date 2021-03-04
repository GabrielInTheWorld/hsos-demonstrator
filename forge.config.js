module.exports = {
	makers: [
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin", "linux", "windows"],
			config: {},
		},
		{
			name: "@electron-forge/maker-squirrel",
			config: {
				name: "Demonstrator",
			},
		},
	],
};
