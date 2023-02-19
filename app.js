const express = require('express');
const mongoose = require('mongoose');
const Defect = require('./models/defect.js')
const morgan = require('morgan')
require('dotenv/config');

//express app
const app = express();

//register view engine (ejs), if folder != "views", second line put app.set('views', 'myviews')
app.set('view engine', 'ejs')

//connect to mongo database, URL must set below app = express()								/here is the database name, if not exist will create new one
// const dbURI = 'mongodb+srv://rnd01:rnd12345@nodejs-tutorial.8narwid.mongodb.net/note-tuts?retryWrites=true&w=majority' //remember log in db acc, and go to the database set your IP to netword access
// mongoose.connect(dbURI) //mongoose.connect(dbURI, {useNewUrlParses: true, useUnifiedTopology: true}) parameter is to stop a Deprecation warning. mongoose.connect is a asynchro called
// 	.then((result) => app.listen(4000)) //you can set app.listen to ensure client only may link to the website while database connection successfully. !!!Using nodemon cannot see console
// 	.catch((err) => console.log(err));

// //listen for requests
// app.listen(4000); //port number to connect this server

//connect mongodb by .env variable
var listen_port = process.env.PORT || 4000 //get port variable from .env || default port
mongoose.connect(process.env.MONGO_URL, //get mongoDB URl from .env also include the expose port
    { useNewUrlParser: true, useUnifiedTopology: true }) //setNewUrlPraser to true allow users to fall back to the old parser if they find a bug in the new parser. Set UnifiedTopology to true to opt in to using the MongoDB driver's new connection management engine
	.then((result) => app.listen(listen_port)) //is mongodb connect successfully then create the webpage on that port
	.catch((err) => console.log(err));


app.use((req, res, next) => {
	console.log('first app.use');	
	next(); //continue run below code
});



//middleware && static files
app.use(express.static('./public')) //mean the files in ("./public") current folder will become static file, start point is from this folder 
app.use(express.static('./views'))  ////mean the files in ("./views") current folder will become static file, if link to this file will be downloaded
app.use(morgan('tiny')) //morgan (3 party middleware) will return a value on console
app.use(express.urlencoded({ extended: true })) //while sending form/post request, assign the data to "req.body" 

// // mongoose and mongo sandbox routes
// //store data to mongo, by url
app.get('/add-defect', (req,res) => {
	const defect = new Defect({ //here is create a new defect, follow the DOM on ./models/defect.js
		title: "new defect 3",
		snippet: 'about my new defect3',
		body: 'more about my  defect3',
		hihi: 123.04
	})

	defect.save() //save defect to collection
		.then((result) => {
			res.send(result)
		})
		.catch((err) => {
			console.log(err)
		})

})

//store data to mongo, by form
app.post('/defects', (req, res) => { //this will be trigger when form is submit. Since form is set as post request, use post
	//console.log(req.body) //this will get form data
	const defect = new Defect(req.body)
	defect.save() //save defect to collection
	.then((result) => {
		res.redirect('/defects') //redirect to /defects
	})
	.catch((err) => {
		console.log(err)
	})
})

//get all data from mongo, but retrieve a JSON format
app.get('/get-all-defects', (req,res) => {
	Defect.find() //get all data from Defect
		.then((result) => {
			res.send(result)
			console.log(result[3].title)
		})
		.catch((err) => {
			console.log(err)
		})

})

//get specific data from mongo by object id
app.get('/get-single-defects', (req,res) => {
	Defect.findById('63a55249620fc463315731c4') //get the data(JSON format) with this object id
		.then((result) => {
			res.send(result)
		})
		.catch((err) => {
			console.log(err)
		})

})

//routes
app.get('/', (req,res) => {
	// res.send('<h1>pong</h1>'); // create and link to textplain website
	const defects = [			// create own data and inject to the website
		{title: 'You are my fire', snippet: 'The one desired'},
		{title: 'believe what I said', snippet: 'I want it that way'},
		{title: 'Tell me why', snippet: 'aim noting but a mistake'},
	]
	res.render('index', {title: 'Home', defects: defects}); //if install ejs, must use res.render(), filename is acceptable
});

//defect route, to sync data from mongodb
app.get('/defects', (req,res) => {
	Defect.find() //get all data from Defect
	.then((result) => {
		res.render('index', {title: 'History', defects: result}); //inject db data to index
	})
	.catch((err) => {
		console.log(err)
	})
});


app.get('/about', (req,res) => {
	//res.sendFile('./views/about.html', { root: __dirname }); // create and link to link to the exist.html file, format: (html file, starting point)
	res.render('about', {title: 'About Us'}); 
});

app.get('/create', (req,res) => {
	res.render('create', {title: 'Create Defect'})
});

app.get('/oldAbout', (req,res) => { //redirect old link to new link
	res.redirect('/about')
});

//get specific data from mongo by object id with get request and route parameter
app.get('/:id', (req,res) => {
	const id = req.params.id;
	console.log(id); //6396abcefe283ce640c26f2f
	Defect.findById(id) //get the data with this object id
		.then((result) => {
			res.render('details', {defect: result, title:'Defect Details'}) //pass the data(specify id) to details 
		})
		.catch((err) => {
			// console.log(err) //if not found console show error
			res.status(404).render('404', {title: 'Defect not found'}); //if not found redirect to 404 page
		})

})

//delete request
app.delete('/:id', (req,res) => {
	const id = req.params.id;

	Defect.findByIdAndDelete(id) //get the data with this object id, and delete it
		.then(result => {
			res.json({ redirect: '/defects'}) //here is the json object, { keyword : <redirect link>}, for delete cannot use redirect
		})
		.catch((err) => {
			console.log(err) 
		})

})

app.use((req,res) => { //***default, use() function will trigger for every single request, and once this function trigger will ignore all below function, thus this funtion must last one****
	//res.status(404).sendFile('./views/404.ejs', { root: __dirname }) //status(status code) 
	res.status(404).render('404', {title: '404 Page not found'}); 
}); 