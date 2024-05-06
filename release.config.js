module.exports =  {
	"plugins": [
	  // additional config...
	  "@semantic-release/release-notes-generator",
	  ["@semantic-release/github", {
		 "assets": [
			{"path": "dist/SpinWheel.js", "label": "SpinWheel.js"},
			{ "path": "SpinWheelWithEntry.firebotsetup", "label": "SpinWheelWithEntry.firebotsetup"}
		 ]
	  }],
	]
 }
