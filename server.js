const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(3000).sockets;

// Connect Mongo
mongo.connect('mongodb://localhost/mongochat', (err, db) => {
    if (err) {
        throw err;
    }
    console.log('Mongdb is connecting....');
    // Connect Socket
    client.on('connection', (socket) => {
        let chat = db.collection('chat');
        // function to send status
        sendStatus = (s) => {
            socket.emit('status', s);
        }
        // get chat from mongo collection
        chat.find().limit(100).sort({_id: 1}).toArray( (err, res) => {
            if (err) {
                throw err
            }
            // emit messages
            socket.emit('output', res);
        });

        // Handle input event
        socket.on('input', (data) => {
            let name = data.name;
            let message = data.message;
            // check for name and message
            if (name === '' || message === '') {
                sendStatus('Please Enter Name and Message');
            } else {
                // insert message to db
                chat.insert({name: name, message: message}, () => {
                    client.emit('output', [date]);
                    // send status obj
                    sendStatus({
                        messageL: 'Message send', clear: true
                    });
                });
            }
        });
        // Handle clear
        socket.on('clear', (data) => {
            // remove all chats from collection
            chat.remove({}, () => {
                socket.emit('Clear');
            });
        });
    });
});