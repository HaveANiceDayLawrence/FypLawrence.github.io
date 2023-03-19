const express = require('express');
const mongoose = require('mongoose'); 
const Defect = require('./models/defect.js')
const morgan = require('morgan')
require('dotenv/config'); //import this file for using .env variable


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
	// console.log(req.file.filename);	
	next(); //continue run below code
});



//middleware && static files
app.use(express.static('./public')) //mean the files in ("./public") current folder will become static file, start point is from this folder 
app.use(express.static('./views'))  ////mean the files in ("./views") current folder will become static file, if link to this file will be downloaded
// app.use(express.static('./uploads'))  ////mean the files in ("./uploads") current folder will become static file, if link to this file will be downloaded
app.use(morgan('tiny')) //morgan (3 party middleware) will return a value on console
app.use(express.urlencoded({ extended: true })) //while sending form/post request, assign the data to "req.body" 

// // mongoose and mongo sandbox routes
// //store data to mongo, by url
app.get('/add-defect', (req, res) => {
	const defect = new Defect({ //here is create a new defect, follow the DOM on ./models/defect.js
		title: "new defect 3",
		desc: 'about my new defect3',
		results: "No defects detected"
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
// Set up multer for storing uploaded files

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { publicDecrypt } = require('crypto');
const { resolve } = require('path');


// Define the storage engine for Multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/assets'); //set up where to store the upload pic (in server)
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
	}
});

// Define the file upload middleware using Multer
const upload = multer({ storage: storage });


// Define a route to handle form submissions
//upload.single(<same as your img form input tag name>)
app.post('/defects', upload.fields([{ name: 'image1' }, { name: 'image2' }]), async (req, res) => {
	try {
		// Check if a file was included in the submission
		if (!req.files) {
			throw new Error('\nNo file was uploaded\n');
		}

		//Assign img1 and img2 info to u_img 1 && 2
		var u_img1 = req.files['image1'][0]
		var u_img2 = req.files['image2'][0]
		// console.log(`file before format: ${u_img1}`) //show the original upload full path
		// u_img1 is a object, {filename, fieldname(tagname), originalname(fs filename), minetype, destination, path(with \\) and size}

		//check image size, if > maximum size, delete the file and return to history
		var ImageMaximumSize = 4 * 1024 * 1024; // 4 MB in bytes
		var Image1OverSize = false;
		var Image2OverSize = false;
		if (u_img1.size > ImageMaximumSize) { //check image 1
			console.log(`Reference File ${u_img1.originalname} is too large`);
			Image1OverSize = true;
		}

		if (u_img2.size > ImageMaximumSize) { //check image 2
			console.log(`Suspicious File ${u_img2.originalname} is too large`);
			Image2OverSize = true;

		}

		if (Image1OverSize || Image2OverSize) { //If 1 of images is oversize, delete uploaded images and go back to Form
			fs.unlinkSync(`public\\assets\\${u_img1.filename}`)
			fs.unlinkSync(`public\\assets\\${u_img2.filename}`)
			res.status(400).render('create', { title: 'Create Defect', alert: true })
		}
		else {
			const { spawn } = require('child_process');
			const FormData = require('form-data');

			// Set filename (img.jpg) to ./assets/img.jpg		  
			img1_path = `./assets/${u_img1.filename}`
			img2_path = `./assets/${u_img2.filename}`

			//Set filepath for python script
			const pythonScript = './pythonTest.py'; console.log("Assign python file path")
			const file1 = `./public/assets/${u_img1.filename}`; console.log("Assign python file path")
			const file2 = `./public/assets/${u_img2.filename}`; console.log("Assign python file path")

			const form = new FormData();
			form.append('file1', fs.createReadStream(file1));
			form.append('file2', fs.createReadStream(file2));

			const child = spawn('python', [pythonScript, file1, file2], { stdio: ['pipe', 'pipe', 'inherit'] });

			form.pipe(child.stdin);

			let pthonResult = ''

			child.stdout.on('data', (data) => {
				pthonResult += data;
				console.log(pthonResult.message)
				console.log(typeof data)
				console.log(typeof pthonResult)
			  });
			  child.on('close', async (code) => {
				if (code !== 0) {
				  console.error(`Python script exited with code ${code}`);
				  return res.status(500).send('Error');
				}


			// const R_from_py = await pythonRunner(u_img1.filename, u_img2.filename)
			// var test = [1,2,2,3]
			// console.log('Reply from py line127' + test)
			console.log("result = " + pthonResult)


			// if(python_output == "python_error"){
			// 	console.log("Python side have issue")
			// 	throw new Error('\nCannot access to Python file\n');
			// }





			//Create new Defect Object, We wil customize from data at here, before send to mongodb/defect.save()
			const defect = new Defect({
				title: req.body.title,
				desc: req.body.desc,
				img1: {
					data: img1_path,
					contentType: u_img1.mimetype
				},
				img2: {
					data: img2_path,
					contentType: u_img2.mimetype
				},
				// results: python_output
			});

			// console.log('Reply from py line156' + R_from_py)

			// Save the new Person object to the database
			
			// await defect.save();
			console.log(defect)
		})

			// Send a success message to the client
			res.status(200)
			console.log('\nfile was uploaded successfully\n');
			res.redirect('/defects') //redirect to /defects
			// console.log('Reply from py line166' + R_from_py)
		}
	} catch (err) {
		// Handle any errors that occur during the upload process
		console.error(err);
		res.status(500).send('Error uploading data to MongoDB');

	}
});

//get all data from mongo, but retrieve a JSON format
app.get('/get-all-defects', (req, res) => {
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
app.get('/get-single-defects', (req, res) => {
	Defect.findById('63a55249620fc463315731c4') //get the data(JSON format) with this object id
		.then((result) => {
			res.send(result)
		})
		.catch((err) => {
			console.log(err)
		})

})

//routes
app.get('/', (req, res) => {
	// res.send('<h1>pong</h1>'); // create and link to textplain website
	const defects = [			// create own data and inject to the website
		{ title: 'New Defects', desc: 'Upload PCB pictures and information for detection', _id: '/create' },
		{ title: 'History', desc: 'Show all detection result', _id: '/defects' },
		{ title: 'About Us', desc: 'More details for website and develop team', _id: '/about' },
	]
	res.render('index', { title: 'Home', defects: defects }); //if install ejs, must use res.render(), filename is acceptable
});

//defect route, to sync data from mongodb
app.get('/defects', (req, res) => {
	Defect.find() //get all data from Defect
		.then((result) => {
			res.render('history', { title: 'History', defects: result }); //inject db data to history
		})
		.catch((err) => {
			console.log(err)
			console.log("upload form have issue --- now is developing db picture format")
		})
});


app.get('/about', (req, res) => {
	//res.sendFile('./views/about.html', { root: __dirname }); // create and link to link to the exist.html file, format: (html file, starting point)
	res.render('about', { title: 'About Us' });
});

app.get('/create', (req, res) => {
	res.render('create', { title: 'Create Defect', alert: false })
});

app.get('/oldAbout', (req, res) => { //redirect old link to new link
	res.redirect('/about')
});

//get specific data from mongo by object id with get request and route parameter
app.get('/:id', (req, res) => {
	const id = req.params.id;
	console.log(id); //6396abcefe283ce640c26f2f
	Defect.findById(id) //get the data with this object id
		.then((result) => {
			res.render('details', { defect: result, title: 'Defect Details' }) //pass the data(specify id) to details 
		})
		.catch((err) => {
			// console.log(err) //if not found console show error
			res.status(404).render('404', { title: 'Defect not found' }); //if not found redirect to 404 page
		})

})

//delete request
app.delete('/:id', (req, res) => {
	const id = req.params.id;

	Defect.findByIdAndDelete(id) //get the data with this object id, and delete it
		.then(result => {

			// delete the picture file from disk
			//get the path name
			console.log(result)
			var delete_img1 = result.img1.data || "unfound1.jpg";
			var delete_img2 = result.img2.data || "unfound2.jpg";
			delete_img1 = delete_img1.replace('./assets/', 'public\\assets\\')
			delete_img2 = delete_img2.replace('./assets/', 'public\\assets\\')
			// console.log(delete_path)


			if (fs.existsSync(delete_img1) && fs.existsSync(delete_img2)) {
				console.log("delete file are detected")
				fs.unlinkSync(delete_img1)
				fs.unlinkSync(delete_img2)
				console.log("file delete successfully")
			}
			else if (!fs.existsSync(delete_img1) && fs.existsSync(delete_img2))
				console.log("reference file cannot detected")
			else if (!fs.existsSync(delete_img2) && fs.existsSync(delete_img1))
				console.log("suspicious file cannot detected")
			else
				console.log('delete file are unfound')



			res.json({ redirect: '/defects' }) //here is the json object, { keyword : <redirect link>}, for delete cannot use redirect
		})
		.catch((err) => {
			console.log(err)
		})

})

app.use((req, res) => { //***default, use() function will trigger for every single request, and once this function trigger will ignore all below function, thus this funtion must last one****
	//res.status(404).sendFile('./views/404.ejs', { root: __dirname }) //status(status code) 
	res.status(404).render('404', { title: '404 Page not found' });
});


function sendImgToPython(path1, path2) {
	// Function body goes here...
	const { spawn } = require('child_process');
	const FormData = require('form-data');
	const fs = require('fs');

	const pythonScript = './pythonTest.py'; console.log("Python: read python file")
	const file1 = `./public/assets/${path1}`; console.log("Python: read image 1" + file1)
	const file2 = `./public/assets/${path2}`; console.log("Python: read image 2")

	const form = new FormData();
	form.append('file1', fs.createReadStream(file1));
	form.append('file2', fs.createReadStream(file2));

	const child = spawn('python', [pythonScript, file1, file2], { stdio: ['pipe', 'pipe', 'inherit'] });

	form.pipe(child.stdin);

	//read message from python, and return the value
	child.stdout.on('data', async (data) => {
		const json = Buffer.from(data, 'base64').toString('utf-8');
		const output = JSON.parse(json);
		console.log(output.message);
		return output.message;
	});

	child.on('close', async (code) => {
		if (code !== 0) {
			console.error(`Python script exited with code ${code}`);
			return "python_error";
		}

		return "hihi"
	});


}

async function pythonRunner(path1, path2) {
	console.log('Starting Python script...');
	return sendImgToPython(path1, path2)
		.then(() => {
			console.log('Python script finished!');
		})
		.catch((err) => {
			console.error('Error running Python script:', err);
		});
}
