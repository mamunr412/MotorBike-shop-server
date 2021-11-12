const express = require('express')
const app = express();
var cors = require('cors')
const { MongoClient, Admin } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;
const { query } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;

// midelware 
app.use(express.json());
app.use(cors());

// connect to database 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jjz52.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db('motorbike_shop');
        const ProductsCollection = database.collection("products");
        const usersCollection = database.collection("users");
        const oderColletion = database.collection('allOders')

        // get all products 
        app.get('/products', async (req, res) => {
            const result = await ProductsCollection.find({}).toArray();
            res.json(result)
        })
        // get single bike 
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) }
            const result = await ProductsCollection.findOne(query);
            res.json(result);
        });
        // deleted single product 
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const result = await ProductsCollection.deleteOne({ _id: ObjectID(id) });
            res.json(result)
            console.log(result)
        })
        // saved oder data to database 
        app.post('/oderBike', async (req, res) => {
            const result = await oderColletion.insertOne(req.body);
            res.json(result)
        });
        // get single user oderinformation
        app.get('/oderBike', async (req, res) => {
            let filter = {};
            const email = req.query.email;
            if (email) {
                const filter = { email: email }
                const result = await oderColletion.find(filter).toArray();
                res.json(result)
            }
            else {
                filter = {};
            }
        })
        // cancel oder
        app.delete('/oderDelete/:id', async (req, res) => {
            const id = req.params.id;
            const result = await oderColletion.deleteOne({ _id: ObjectID(id) });
            res.json(result);

        });


        // get all oders
        app.get('/allOders', async (req, res) => {
            const result = await oderColletion.find({}).toArray();
            res.json(result)
        });

        // update status 
        app.put('/Update/:id', async (req, res) => {
            const id = req.params.id;
            const update = { $set: { status: 'shipped' } };
            const result = await oderColletion.updateOne({ _id: ObjectID(id) }, update);
            res.json(result)

        });
        // add new product 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await ProductsCollection.insertOne(product);
            res.json(result);

        })



        app.get('/users', async (req, res) => {
            const result = await usersCollection.find({}).toArray()
            res.json(result)
        })
        // saved user 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })
        // make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })
        // get Admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log('motorbike shop', port)
})