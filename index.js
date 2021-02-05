const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

let users = []
let connections = []

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    connections.push(socket)
    console.log(`Connected: ${connections.length} sockets Connected`)

    // send message
    socket.on('send message', (data) => {
        console.log(`message: ${data}`)
        io.emit('new message', {msg: data, user: socket.username})
    })

    // new user
    socket.on('new user', (data,cb) => {
        cb(true)
        console.log(`user: ${data}`)
        
        socket.username = data
        users.push(socket.username)
        socket.broadcast.emit('new user joined', socket.username)
        updateUsernames()
        
    })

    
    // Disconnect
    socket.on('disconnect', (data) => {
    
        users.splice(users.indexOf(socket.username), 1)
        socket.broadcast.emit('user leave', socket.username)
        updateUsernames()
        connections.splice(connections.indexOf(socket), 1)

        console.log(`Disconnected: ${connections.length} sockets Connected`)
    })

    function updateUsernames(){
        io.emit('get users', users)
    }
})



http.listen(8000, () => console.log('Server is running at PORT 8000'))