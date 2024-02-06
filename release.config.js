module.exports =  {
	"plugins": [
	  // additional config...
 
	  ["@semantic-release/github", {
		 "assets": [
			{"path": "dist/SpinWheel.js", "label": "SpinWheel.js"}
		 ]
	  }],
	]
 }