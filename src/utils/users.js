const users = [];

// ============================================ Add new user  ============================================
const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    
    // validate the data
    if (!username) {
        return {
            error: 'Username is required'
        }
    } else if (!room) {
        return { 
            error: 'Room name is required' 
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    // validate username and room
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // store user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

// ============================================ Remove user  ============================================
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    } else {
        return {
            error: 'Username with that id is not available'
        }
    }
}

// ============================================ Get user  ============================================
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// ============================================ Get users in room ============================================
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room)
}

module.exports = {
     addUser,
     removeUser,
     getUser,
     getUsersInRoom
}