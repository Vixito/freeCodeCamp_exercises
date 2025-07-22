const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
})
const User = mongoose.model('User', userSchema)
const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
})
const Exercise = mongoose.model('Exercise', exerciseSchema)

// Create a new user
app.post('/api/users', async (req, res) => {
  const username = req.body.username
  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }
  try {
    const user = new User({ username })
    await user.save()
    res.json({ _id: user._id, username: user.username })
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' })
  }
})

// List all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { __v: 0 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' })
  }
})

// Add an exercise for a user
app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id
  const { description, duration, date } = req.body
  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' })
  }
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const exerciseDate = date ? new Date(date) : new Date()
    const exercise = new Exercise({
      userId: user._id,
      description,
      duration,
      date: exerciseDate
    })
    await exercise.save()
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    })
  } catch (error) {
    res.status(500).json({ error: 'Error adding exercise' })
  }
})

// Get log of exercises for a user
app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id
  const { from, to, limit } = req.query
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const query = { userId: user._id }
    if (from) {
      query.date = { $gte: new Date(from) }
    }
    if (to) {
      query.date = { ...query.date, $lte: new Date(to) }
    }
    const exercises = await Exercise.find(query).limit(parseInt(limit) || 100).select({
      _id: 0,
      userId: 0,
      __v: 0
    })
    const log = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }))
    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log
    })
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exercise log' })
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
