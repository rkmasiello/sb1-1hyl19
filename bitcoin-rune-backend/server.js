const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  ScanCommand 
} = require("@aws-sdk/lib-dynamodb");

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); // replace with your region
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "BitcoinRuneUsers"; // replace with your table name

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { bitcoinAddress, ethereumAddress, twitter, telegram, email, referralCode } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await getUserByBitcoinAddress(bitcoinAddress);
    
    if (existingUser) {
      // User exists, update information and points
      const updatedUser = await updateExistingUser(existingUser, { ethereumAddress, twitter, telegram, email });
      res.status(200).json({ userId: updatedUser.userId, referralCode: updatedUser.referralCode, message: 'User updated' });
    } else {
      // New user registration
      const userId = uuidv4();
      const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newUser = {
        userId,
        referralCode: newReferralCode,
        bitcoinAddress,
        ethereumAddress,
        twitter,
        telegram,
        email,
        points: calculateInitialPoints({ bitcoinAddress, ethereumAddress, twitter, telegram, email }),
        createdAt: new Date().toISOString()
      };
      
      if (referralCode) {
        const referralResult = await handleReferral(referralCode, userId);
        if (referralResult.success) {
          newUser.points += 100; // Bonus for using a referral code
          newUser.referredBy = referralResult.referrerId;
        }
      }

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: newUser
      }));

      console.log('New User Registered:', newUser);
      res.status(201).json({ userId, referralCode: newReferralCode, message: 'User registered' });
    }
  } catch (error) {
    console.error('Error in registration process:', error);
    res.status(500).json({ message: 'Error in registration process', error: error.toString() });
  }
});

async function getUserByBitcoinAddress(bitcoinAddress) {
  const { Items } = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'bitcoinAddress = :bitcoinAddress',
    ExpressionAttributeValues: {
      ':bitcoinAddress': bitcoinAddress
    }
  }));
  return Items && Items.length > 0 ? Items[0] : null;
}

async function updateExistingUser(user, newData) {
  const updateExpressions = [];
  const expressionAttributeValues = {};
  let pointsToAdd = 0;

  if (newData.ethereumAddress && !user.ethereumAddress) {
    updateExpressions.push('ethereumAddress = :ethereumAddress');
    expressionAttributeValues[':ethereumAddress'] = newData.ethereumAddress;
    pointsToAdd += 50;
  }

  if (newData.twitter && !user.twitter) {
    updateExpressions.push('twitter = :twitter');
    expressionAttributeValues[':twitter'] = newData.twitter;
    pointsToAdd += 1000;
  }

  if (newData.telegram && !user.telegram) {
    updateExpressions.push('telegram = :telegram');
    expressionAttributeValues[':telegram'] = newData.telegram;
    pointsToAdd += 500;
  }

  if (newData.email && !user.email) {
    updateExpressions.push('email = :email');
    expressionAttributeValues[':email'] = newData.email;
    pointsToAdd += 1000;
  }

  if (pointsToAdd > 0) {
    updateExpressions.push('points = points + :pointsToAdd');
    expressionAttributeValues[':pointsToAdd'] = pointsToAdd;
  }

  if (updateExpressions.length > 0) {
    const updateExpression = 'SET ' + updateExpressions.join(', ');
    
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId: user.userId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));
  }

  return { ...user, ...newData, points: user.points + pointsToAdd };
}

async function handleReferral(referralCode, newUserId) {
  try {
    console.log('Searching for referrer with code:', referralCode);
    const { Items } = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'referralCode = :referralCode',
      ExpressionAttributeValues: {
        ':referralCode': referralCode
      }
    }));

    if (Items && Items.length > 0) {
      const referrer = Items[0];
      // Check if referrer has already received a bonus for this user
      if (!referrer.referredUsers || !referrer.referredUsers.includes(newUserId)) {
        console.log('Updating referrer points:', referrer.userId);
        
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { userId: referrer.userId },
          UpdateExpression: 'ADD points :points, referredUsers :newUser',
          ExpressionAttributeValues: {
            ':points': 2000,
            ':newUser': docClient.createSet([newUserId])
          }
        }));

        console.log(`Referral bonus applied. User ${referrer.userId} received 2000 points.`);
        return { success: true, referrerId: referrer.userId };
      } else {
        console.log(`Referral bonus already applied for user ${newUserId}`);
        return { success: false };
      }
    } else {
      console.log(`Invalid referral code: ${referralCode}`);
      return { success: false };
    }
  } catch (error) {
    console.error('Error handling referral:', error);
    return { success: false };
  }
}

async function handleReferral(referralCode, newUserId) {
  try {
    console.log('Searching for referrer with code:', referralCode);
    const { Items } = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'referralCode = :referralCode',
      ExpressionAttributeValues: {
        ':referralCode': referralCode
      }
    }));

    console.log('Scan result:', Items);

    if (Items && Items.length > 0) {
      const referrer = Items[0];
      console.log('Updating referrer points:', referrer.userId);
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId: referrer.userId },
        UpdateExpression: 'ADD points :points',
        ExpressionAttributeValues: {
          ':points': 2000
        }
      }));

      console.log('Updating new user points:', newUserId);
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId: newUserId },
        UpdateExpression: 'ADD points :points',
        ExpressionAttributeValues: {
          ':points': 100
        }
      }));

      console.log(`Referral bonus applied. User ${referrer.userId} received 2000 points.`);
      return { success: true };
    } else {
      console.log(`Invalid referral code: ${referralCode}`);
      return { success: false };
    }
  } catch (error) {
    console.error('Error handling referral:', error);
    return { success: false };
  }
}

// Get user points endpoint
app.get('/points/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      ProjectionExpression: 'points'
    }));

    if (Item) {
      res.json({ points: Item.points });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user points:', error);
    res.status(500).json({ message: 'Error getting user points' });
  }
});

// Get referral info endpoint
app.get('/referral/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      ProjectionExpression: 'referralCode'
    }));

    if (Item) {
      // Count referrals
      const { Count } = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'referredBy = :userId',
        ExpressionAttributeValues: { ':userId': userId },
        Select: 'COUNT'
      }));

      res.json({ 
        referralCode: Item.referralCode,
        referralCount: Count || 0
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting referral info:', error);
    res.status(500).json({ message: 'Error getting referral info' });
  }
});

// Get user endpoint
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    }));

    if (Item) {
      res.json(Item);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Error getting user' });
  }
});

// Update points endpoint
app.post('/points/update', async (req, res) => {
  const { userId, pointsToAdd } = req.body;
  
  try {
    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: 'ADD points :points',
      ExpressionAttributeValues: {
        ':points': pointsToAdd
      },
      ReturnValues: 'ALL_NEW'
    }));

    res.json({ points: Attributes.points });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ message: 'Error updating points' });
  }
});

// Leaderboard endpoint
app.get('/leaderboard', async (req, res) => {
  try {
    const { Items } = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      ProjectionExpression: 'userId, referralCode, points'
    }));

    const leaderboard = Items.sort((a, b) => b.points - a.points).slice(0, 100);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Error getting leaderboard' });
  }
});

function calculateInitialPoints(userData) {
  let points = 0;
  if (userData.bitcoinAddress) points += 50;
  if (userData.ethereumAddress) points += 50;
  if (userData.twitter) points += 1000;
  if (userData.telegram) points += 500;
  if (userData.email) points += 1000;
  return points;
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});