const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({ extended: true }));

const monurl = 'mongodb://localhost:27017/';
const dbname = 'college';
let db;

MongoClient.connect(monurl)
    .then((client) => {
        db = client.db(dbname);
        console.log(`Connected to MongoDB: ${dbname}`);
    })
    .catch((err) => {
        console.error('Error Connecting to db', err);
        process.exit(1);
    });

app.get('/', (req, res) => {
        res.sendFile(__dirname + '/exp.html');
});

app.post('/insert', async (req, res) => {
    const { name, num, mail } = req.body;
    if (!db) {
        res.status(500).send('Database not initialized');
        return;
    }
    try {
        const result = await db.collection('records').insertOne({ name, num, mail });
        console.log('Number of records inserted: ' + result.insertedCount);
        res.redirect('/');
    } catch (err) {
        console.error('Error inserting data', err);
        res.status(500).send('Failed to insert data');
    }
});

app.get('/report', async (req, res) => {
    try {
        const records = await db.collection('records').find().toArray();
        console.log(records);

        let tablecontent = `
            <style>
                body {
                    background: url('https://wallpapers.com/images/hd/light-color-background-mnlddibgcjjuzq8a.jpg');
                    background-size: cover;
                    background-repeat: no-repeat;
                }
                table th, td {
                    max-width: 100%;
                    border: 1px solid; 
                    font-size: 1rem;   
                    font-weight: bold;           
                }
                table {
                    margin: 7rem auto;
                    min-height: auto;
                }
                th, td {
                    table-border: 0.5px;
                    padding: 1.2rem;
                    font-size: 1.2rem;
                }
                h1 {
                    text-align: center;
                    font-family: verdana;
                }
                a {
                    text-decoration: underline;
                }
                button a {
                    text-decoration: none;
                    font-size: 1.2rem;
                    color: black;
                    margin: 0.5rem;
                    font-size: 1.2rem;
                    width: 6rem;
                    height: 2.5rem;
                }
                button a:hover {
                    background-color: yellow;
                }
                button {
                    border-radius: 30%;
                }
                .back {
                    width: 8rem;
                    height: 4rem;
                    margin-left: 36rem;
                }
            </style>
            <h1>Report</h1>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Action1</th>
                    <th>Action2</th>
                </tr>`;

        tablecontent += records.map(item => `
            <tr>
                <td>${item.name || '  '}</td>
                <td>${item.num || ' '}</td>
                <td>${item.mail || ' '}</td>
                <td>
                    <button><a href="/change/${item.name}">Update</a></button>  
                </td>
                <td>
                    <button><a href="/delete/${item.name}">Delete</a></button> 
                </td>
            </tr>`).join(" ");

        tablecontent += `</table><button class="back" onclick="location.href='/'">Back to Form</button>`;
        res.send(tablecontent);
    } catch (err) {
        console.error("Error fetching data", err);
        res.status(500).send('Unable to fetch data');
    }
});

app.get('/change/:name', (req, res) => {
    res.sendFile(__dirname + '/update.html');
});

app.post('/update/:name', async (req, res) => {
    try {
        const un = req.params.name;
        const { name, num, mail } = req.body;
        const result = await db.collection('records').updateOne({ 'name': un }, { $set: { name, num, mail } });
        console.log('Number of records updated: ' + result.modifiedCount);
        res.redirect('/report');
    } catch (err) {
        console.error('Error updating data', err);
        res.status(500).send('Unable to update data');
    }
});

app.get('/delete/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const result = await db.collection('records').deleteOne({ name });
        console.log('Number of records deleted: ' + result.deletedCount);
        res.redirect('/report');
    } catch (err) {
        console.error('Unable to delete data', err);
        res.status(500).send('Failed to delete data');
    }
});

app.listen(7800, () => {
    console.log("Server running on port 7800");
});

