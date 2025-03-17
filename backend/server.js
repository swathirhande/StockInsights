const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());
const fromDate = calculatePrevYearDate();
const thirtydays = calculatethrity();
const toDate = getCurrentDate();
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

const finnhubApiKey = process.env.FINHUB_API_KEY;
const apiKey = process.env.API_KEY;
const path =require('path');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/searchs/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker;

    const [profileResponse, quoteResponse, peerResponse, chartsResponse, newsResponse, insightResponse, recommendationResponse,earningsResponse] = await Promise.all([
      axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${finnhubApiKey}`),
      axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${finnhubApiKey}`),
      axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${finnhubApiKey}`),
      axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${apiKey}`),
      axios.get(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${thirtydays}&to=${toDate}&token=${finnhubApiKey}`),
      axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=2022-01-01&token=${finnhubApiKey}`),
      axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${finnhubApiKey}`),
      axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${finnhubApiKey}`)
    ]);
  
    const profileData = profileResponse.data;
    const quoteData = quoteResponse.data;
    const peerData = peerResponse.data;
    const chartsData = chartsResponse.data;
    const newsData = newsResponse.data;
    const insightData = insightResponse.data;
    const recommendationData = recommendationResponse.data;
    const earningsData = earningsResponse.data;

    const combinedData = {
      profile: profileData,
      quote: quoteData,
      peer: peerData,
      charts: chartsData,
      news: newsData,
      insights: insightData,
      recommendation: recommendationData,
      earing: earningsData
    };

    res.json(combinedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function getAutocompleteData(query) {
    let queryInput = query.toUpperCase();
    console.log('Fetching autocomplete data...');
    console.log('value of query is', query);
    const url = `https://finnhub.io/api/v1/search?q=${queryInput}&token=${finnhubApiKey}`;
    console.log('Value of the url is', url);
    console.log('for input', query);

    return axios.get(url).then(response => {
        console.log('Response from the API:', response.data);
        const results = response.data.result;
        console.log('Results:', results);
        if (results && Array.isArray(results)) {
            const filteredResults = results.filter(result => result.displaySymbol.toUpperCase().startsWith(queryInput));
            console.log('Filtered results:', filteredResults);
            const mappedResults = filteredResults.map(result => ({
                description: result.description,
                displaySymbol: result.displaySymbol
            }));
            console.log('Mapped results:', mappedResults);
            return mappedResults;
        } else {
            throw new Error('Invalid response format. Expected an array within a "result" property.');
        }
    }).catch(error => {
        console.error('Error fetching autocomplete data:', error);
        throw new Error('Failed to fetch autocomplete data');
    });
}
app.get('/autocomplete/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const autocompleteData = await getAutocompleteData(query);
        res.json(autocompleteData);
    } catch (error) {
        console.error('Error fetching autocomplete data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const uri = process.env.MONGODB_URI1;
const dbName = process.env.DBNAME1; 
const collectionName = process.env.COLLECTION_NAME1;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/toggleStar', async (req, res) => { 
  try {
    const { ticker, name, c, d, dp } = req.query;
    
    await client.connect();
   const db = client.db(dbName);
   const collection = db.collection(collectionName);
   const result = await collection.insertOne({ ticker, name, c, d, dp });
    res.status(200).json({ message: 'Data stored successfully', insertedId: result.insertedId });
   
  } catch (err) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
});


app.get('/watchlist', async (req, res) => {
  try {
      
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      console.log('Documents received from DB to send to watchlist',documents);
      res.status(200).json(documents);
  } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  } finally {
      
      await client.close();
  }
});

let dbClient;
const uri2 = process.env.MONGODB_URI1;
const clients2 = new MongoClient(uri2, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
clients2.connect().then((connectedClient) => {
  dbClient = connectedClient;
  console.log("Connected to MongoDB for persistent connection");
}).catch((error) => {
  console.error("Could not connect to MongoDB", error);
});

app.get('/cashbalance', async (req, res) => {
  const dbName = process.env.DBNAME2; 
const collectionName = process.env.COLLECTION_NAME2;  

  try { 
      const db = dbClient.db(dbName);
      console.log('Database name inside /cashbalance:', db.databaseName);
      const collection = db.collection(collectionName);
      console.log('Collection name inside /cashbalance:', collection.collectionName);
      const document = await collection.findOne({});
      const cashBalance = parseFloat(document.cashbalance.replace('$', '').replace(',', ''));
      const formattedCashBalance = cashBalance.toFixed(2);
      console.log('Value of cashBalance returned from backend is:', formattedCashBalance);
      res.status(200).json({ cashBalance: formattedCashBalance });
  } catch (error) {
      console.error('Error fetching cash balance:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  } 
});



app.get('/buystock', async (req, res) => {
  const dbName = process.env.DBNAME2; 
const collectionName = process.env.COLLECTION_NAME2;  

  try {
    const remainingAmount = req.query.remainingAmount;
    console.log('Remaining Amount in server.js is:', remainingAmount);
    await client.connect();
    const db = client.db(dbName);
    console.log('Database name inside /cashbalance:', db.databaseName);
    const collection = db.collection(collectionName);
    console.log('Collection name inside /cashbalance:', collection.collectionName);
    const result = await collection.updateOne({}, { $set: { cashbalance: remainingAmount } });
    console.log(`${result.modifiedCount} document(s) updated from backend script.js`);
    res.status(200).json({ remainingAmount: remainingAmount });
  } catch (error) {
      console.error('Error updating the value of cash balance:', error);
      res.status(500).json({ remainingAmount: remainingAmount });
  } finally {
      await client.close();
  }
   
});


const uris = process.env.MONGODB_URI2

const clients = new MongoClient(uris, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.get('/portfolioDetails', async (req, res) => {
  const dbName = process.env.DBNAME3;
  const collectionName = process.env.COLLECTION_NAME3;
  try {
    const { tickerSymbol, nameSymbol, quantityDetails, Total, AverageCost } = req.query;

    await clients.connect();
    const db = clients.db(dbName);
    const collection = db.collection(collectionName);
    const document = await collection.findOne({ tickerSymbol: tickerSymbol });

    if (document) {
      if (typeof document.quantityDetails === 'string') {
        document.quantityDetails = parseInt(document.quantityDetails, 10);
      }

      const newTotal = parseFloat(document.Total) + parseFloat(Total);
      const newAverageCost = (parseFloat(document.AverageCost) + parseFloat(AverageCost)) / 2;

      const update = {
        $set: {
          nameSymbol,
          Total: newTotal.toString(),
          AverageCost: newAverageCost.toString(),
          quantityDetails: document.quantityDetails + parseInt(quantityDetails, 10)
        }
      };

      const filter = { tickerSymbol: tickerSymbol };
      await collection.updateOne(filter, update);
      res.status(200).json({ message: 'Document updated' });
    } else {
      const newDocument = {
        tickerSymbol,
        nameSymbol,
        quantityDetails: parseInt(quantityDetails, 10),
        Total,
        AverageCost
      };

      await collection.insertOne(newDocument);
      res.status(200).json({ message: 'New document created' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await clients.close();
  }
});


app.get('/updatingDetails', async (req, res) => {
  const dbName = process.env.DBNAME3;
  const collectionName = process.env.COLLECTION_NAME3;
  try {
    const { tickerSymbol, nameSymbol, quantityDetails, Total, AverageCost } = req.query;

    await clients.connect();
    const db = clients.db(dbName);
    const collection = db.collection(collectionName);
    const document = await collection.findOne({ tickerSymbol: tickerSymbol });

    if (document) {
      let existingQuantity = parseInt(document.quantityDetails, 10);
      const quantityToUpdate = parseInt(quantityDetails, 10);
      const newQuantity = existingQuantity - quantityToUpdate;

      if (newQuantity > 0) {
        const newTotal = parseFloat(document.Total) - parseFloat(Total);
        const newAverageCost = (parseFloat(document.AverageCost) + parseFloat(AverageCost)) / 2;

        const update = {
          $set: {
            nameSymbol,
            Total: newTotal.toString(),
            AverageCost: newAverageCost.toString(),
            quantityDetails: newQuantity
          }
        };

        await collection.updateOne({ tickerSymbol: tickerSymbol }, update);
        res.status(200).json({ message: 'Document updated' });
      } else {
        
        await collection.deleteOne({ tickerSymbol: tickerSymbol });
        res.status(200).json({ message: 'Document deleted as quantity reached 0' });
      }

    } else {
 
      res.status(403).json({ message: 'No document for that ticker found' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await clients.close();
  }
});

app.get('/updateQuantity', async (req, res) => {
  const dbName = process.env.DBNAME3;
  const collectionName = process.env.COLLECTION_NAME3;
  try {
    const { tickerSymbol, nameSymbol, quantityDetails, Total, AverageCost } = req.query;
    await clients.connect();
    const db = clients.db(dbName);
    const collection = db.collection(collectionName);
    const document = await collection.findOne({ tickerSymbol: tickerSymbol });
    if(document)
    {
      const newQuantity = (parseInt(document.quantityDetails, 10) - parseInt(quantityDetails, 10))
      const newTotal = parseFloat(document.Total) - parseFloat(Total);
      const newAverageCost = (parseFloat(document.AverageCost) + parseFloat(AverageCost)) / 2;
      const update = {
        $set: {
          nameSymbol,
          Total: newTotal.toString(),
          AverageCost: newAverageCost.toString(),
          quantityDetails: newQuantity
        }
      };
      const filter = { tickerSymbol: tickerSymbol };
      await collection.updateOne(filter, update);
      res.status(200).json({ message: 'updated successfully' });
    }
    else {
      console.log('ticker symbol not found');
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await clients.close();
  }
});



app.get('/deleteTicker', async (req, res) => {
  const tickerSymbol = req.query.tickerSymbol;
  const dbName = process.env.DBNAME3;
  const collectionName = process.env.COLLECTION_NAME3;
  if (!tickerSymbol) {
    return res.status(400).send('Ticker symbol is null.');
  }

  try {
    await clients.connect();
    const db = clients.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({ tickerSymbol: tickerSymbol });

    if (result.deletedCount === 1) {
      res.status(200).send(`Ticker ${tickerSymbol} deleted successfully.`);
    } else {
      res.status(404).send(`Ticker ${tickerSymbol} not found.`);
    }
  } catch (error) {
    console.error('Error deleting ticker:', error);
    res.status(500).send('Error deleting ticker.');
  }

});


app.get('/getQuantity', async (req, res) => {
  const tickerSymbol = req.query.ticker;
  const dbName = process.env.DBNAME3;
  const collectionName = process.env.COLLECTION_NAME3;
  if (!tickerSymbol) {
    return res.status(400).send('Ticker symbol is required');
  }

  try {
    await clients.connect();
    const db = clients.db(dbName);
    const collection = db.collection(collectionName);

    const document = await collection.findOne({ tickerSymbol: tickerSymbol });

    if (document) {
      res.json({ quantityDetails: document.quantityDetails });
    } else {
      res.status(404).send('Ticker not found');
    }
  } catch (error) {
    console.error('Error fetching quantity details:', error);
    res.status(500).send('Error fetching quantity details');
  } finally {
    await client.close();
  }
});



app.get('/PortfolioInfo', async (req, res) => {

  const dbName = process.env.DBNAME3; 
  const collectionName = process.env.COLLECTION_NAME3;  
  try {
   await clients.connect();
   const db = clients.db(dbName);
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    res.status(200).json(documents); 
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await clients.close();
  }
});


app.get('/callCharts', async (req, res) => {
  try {
    const stocksTicker = req.query.ticker;
    const fromDate = calculateFromDate();
    const toDate = getCurrentDate();
    const url = `https://api.polygon.io/v2/aggs/ticker/${stocksTicker}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${apiKey}`;
    const response = await axios.get(url);
    const responseData = response.data;
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error processing request');
  }
});
function calculateFromDate() {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setMonth(fromDate.getMonth() - 6);
  fromDate.setDate(fromDate.getDate() - 1); 
  return formatDate(fromDate);
}
function calculatePrevYearDate() {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setFullYear(fromDate.getFullYear() - 2);
  fromDate.setDate(fromDate.getDate() - 1);
 return formatYearDate(fromDate);
}

function formatYearDate(date) {
  let day = date.getDate();
  let month = date.getMonth() + 1; 
  let year = date.getFullYear();
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;
  return `${year}-${month}-${day}`;
}
function getCurrentDate() {
  const today = new Date();
  return formatDate(today);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculatethrity()
{
const today = new Date();
const thirtyd = new Date(today.setDate(today.getDate() - 30));
const thirtyday = thirtyd.toISOString().split('T')[0];
console.log('Value returned 30 days prior is:',thirtyday);
 return thirtyday;
}



app.get('/getHourlyChart', (req, res) => {
  const { from, to, userInput } = req.query;
  console.log('Inside the server.js and the from value is:',from);
  console.log('Inside the server.js and the to value is:',to);
  console.log('Inside the server.js and the userInputs value is:',userInput);

  const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${userInput}/range/1/hour/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`;
  axios.get(polygonUrl)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      console.error('Error fetching data from Polygon:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


app.get('/autorefresh/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${finnhubApiKey}`;
  try {
      const response = await axios.get(finnhubUrl);
      console.log('The response from the backend for auto-refresh is:',response.data);
      res.status(200).json(response.data);
  } catch (error) {
      console.error('Error fetching data from Finnhub:', error);
      res.status(500).send('Error fetching stock data');
  }
});

app.get('/endpoint', async (req, res) => {
  const documentId = req.query._id;
  console.log('Received _id:', documentId);
  const dbName = process.env.DBNAME1; 
  const collectionName = process.env.COLLECTION_NAME1;
  try{
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    console.log('Database name in Endpoint:', db.databaseName);
    console.log('Collection name in Endpoint:', collection.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(documentId) });

    if (result.deletedCount === 1) {
      console.log(`Successfully deleted one document with _id: ${documentId}`);
      res.status(200).json({ message: 'Document deleted successfully', _id: documentId });
    } else {
      console.log(`No document found with _id: ${documentId}`);
      res.status(404).json({ message: 'Document not found', _id: documentId });
    }
  }
  catch(error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
} finally {
    await client.close();
}
  
});

app.get('/currentTickerDetails', async (req, res) => {
  const tickerSymbol = req.query.tickerValue;
  const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${tickerSymbol}&token=${finnhubApiKey}`;
  try {
    const finnhubResponse = await axios.get(finnhubUrl);
    if (finnhubResponse.data && finnhubResponse.data.hasOwnProperty('c')) {
      res.status(200).json({ c: finnhubResponse.data.c });
    } 
    else {
      res.status(404).json({ error: 'Value not found in API response' });
    } 
  } catch (error) {
    console.error('Error calling Finnhub API:', error.message);
    res.status(500).json({ error: 'Failed to retrieve data from Finnhub API' });
  }
});

app.get('/getTickerInfo', async (req, res) => {
  const tickerSymbol = req.query.ticker;
  const dbName = process.env.DBNAME1; 
  const collectionName = process.env.COLLECTION_NAME1;
  if (!tickerSymbol) {
    return res.status(400).json({ error: 'Ticker symbol query parameter is required' });
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const document = await collection.findOne({ ticker: tickerSymbol.toUpperCase() });

    if (document) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/deleteStarTicker', async (req, res) => {
  const ticker = req.query.ticker;
  if (!ticker) {
    return res.status(400).send('Ticker symbol not sent to backend');
  }

  const dbName = process.env.DBNAME1;
  const collectionName = process.env.COLLECTION_NAME1;

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({ ticker: ticker });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'ticker symbol not found in db' });
    }
    
    res.status(200).json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post("/ask-ai", async (req, res) => {
  const { question } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { maxOutputTokens: 1000 }
    });

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text()

    res.json({ answer: text });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});