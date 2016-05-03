module.exports = {

  database: 'mongodb://root:Branislav@ds011840.mlab.com:11840/mojabaza',
  port: process.env.port || 3000,
  secretKey: "as$$83$$bc",
  
  facebook: {
	  clientID:  process.env.FACEBOOK_ID || '1540126592947613',
	  clientSecret:  process.FACEBOOK_SECRET || '3cf86b38edebac40f6bde2fdfcf2350a',
	  profileFields: ['emails', 'displayName'],
	  callbackURL: 'http://localhost:3000/auth/facebook/callback'
	  
  }
  

  
}
