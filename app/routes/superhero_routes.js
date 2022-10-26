// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Superhero = require('../models/superhero')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// Index
// /Superheroes
router.get('/superheroes', requireToken, (req, res, next) => {
    Superhero.find()
        .then(superheroes => {
            return superheroes.map(superhero => superhero)
        })
        .then(superheroes =>  {
            res.status(200).json({ superheroes: superheroes })
        })
        .catch(next)
})

//Show
// /superheroes/:id
router.get('/superheroes/:id', requireToken, (req, res, next) => {
    Superhero.findById(req.params.id)
    .then(handle404)
    .then(superhero => {
        res.status(200).json({ superhero: superhero })
    })
    .catch(next)

})

// Create
// /superheroes
router.post('/superheroes', requireToken, (req, res, next) => {
    req.body.superhero.owner = req.user.id

    // one the front end I HAVE TO SEND a superhero as the top level key
    // superhero: {name: '', alias: ''}
    Superhero.create(req.body.superhero)
    .then(superhero => {
        res.status(201).json({ superhero: superhero })
    })
    .catch(next)
    // .catch(error => next(error))

})

// Update
// /superheroes/:id
router.patch('/superheroes/:id', requireToken, removeBlanks, (req, res, next) => {
    delete req.body.superhero.owner

    Superhero.findById(req.params.id)
    .then(handle404)
    .then(superhero => {
        requireOwnership(req, superhero)

        return superhero.updateOne(req.body.superhero)
    })
    .then(() => res.sendStatus(204))
    .catch(next)

})

// DESTROY
// DELETE /superheroes/:id
router.delete('/superheroes/:id', requireToken, (req, res, next) => {
	Superhero.findById(req.params.id)
		.then(handle404)
		.then((superhero) => {
			requireOwnership(req, superhero)
			superhero.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})



module.exports = router