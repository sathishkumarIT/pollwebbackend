const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
// const {Pollweb} = require('./schema');
const jwt = require('jsonwebtoken');
const User = require('./sche');
const Poll= require('./schema.js')
const bcrypt= require('bcrypt');
require('dotenv').config();
const {authenticateToken} = require('./authen');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

async function connectToDB() {
    try {
        await mongoose.connect("mongodb+srv://sathishkumarm2022it:sathish745@cluster0.x8bset9.mongodb.net/Pollweb?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Connected to MongoDB Atlas");
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
    }
}

connectToDB();
app.post('/signup', async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
      });
      await user.save();
      res.status(201).send('User created successfully');
    } catch (error) {
      res.status(500).send('Error creating user'+ error.message);
    }
});
app.post('/login', async (req, res) => {
  try {
   e
    const userss = await User.findOne({ username: req.body.username });
    if (userss) {
      
      const isMatch = await bcrypt.compare(req.body.password, userss.password);
      if (isMatch) {
        res.status(200).send('Login successful, navigating to the next page...');
     
      } else {
        
        res.status(400).send('Login failed, incorrect password.');
      }
    } else {
    
      res.status(404).send('User not found.');
    }
  } catch (error) {
    res.status(500).send('Error logging in user: ' + error.message);
  }
});

  app.post('/vote',async (req,res) => {
    const{question , options } =req.body;
    const formattedOptions = options.map(option => ({ text: option, votes: 0 }));
    const poll= new Poll({
        question ,
        options : formattedOptions,
        
    });
    try{
        const savedPoll = await poll.save();
        res.status(201).json(savedPoll);
    }
    catch(error){
        res.status(500).json({message:'Error saving poll',error})
    }
  });
  app.get('/vote/:id', async (req, res) => {
    try {
      const polll = await Poll.findById(req.params.id);
      if (!polll) {
        res.status(404).send('Poll not found');
      } else {
        res.json(polll);
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving poll', error });
    }
  });

  app.get('/vote', async (req, res) => {
    try {
      // Fetch all polls from the database
      const polls = await Poll.find();
      res.json(polls); 
    } catch (error) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Internal Server Error' }); // Send error response
    }
  });

  app.put('/Vote/:pollId', async (req, res) => {
    const { pollId } = req.params;
    const { option } = req.body;
  
    try {
      const pollm = await Poll.findById(pollId);
      const optionIndex = pollm.options.findIndex(opt => opt.text === option.text);
      pollm.options[optionIndex].votes++;
      await pollm.save();
      res.status(200).json({ message: 'Votes updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  app.delete('/Vote/:pollId', async (req, res) => {
    const { pollId } = req.params;
  
    try {
      await Poll.findByIdAndDelete(pollId);
      res.status(200).json({ message: 'Poll deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  app.post('/Vote/:pollId/vote', async (req, res) => {
    const pollId = req.params.pollId;
    const { optionIndex } = req.body;
  
    try {
    
      const pollssss = await Poll.findById(pollId);
  
    
      if (!pollssss) {
        return res.status(404).json({ error: 'Poll not found' });
      }
  
  
      if (optionIndex < 0 || optionIndex >= pollssss.options.length) {
        return res.status(400).json({ error: 'Invalid option index' });
      }
  
      
      pollssss.options[optionIndex].votes++;
      
     
      await pollssss.save();
  
   
      res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (error) {
      console.error('Error recording vote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
const port =7000;
 app.listen(port, () => {
 console.log(`Server is running on http://localhost:${port}`);
});


