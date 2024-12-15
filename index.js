import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

const userData = [
    {
        id: 1,
        name: "John Doe",
        age: 21
    }, 
    {
        id: 2,
        name: "John Wick",
        age: 43
    }, 
]

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(JSON.parse(body)));
    req.on('error', reject);
  });
}

//create http server
const server = http.createServer(async (req, res) => {
    // const urlParse = url.parse(req.url, true);
    const { url , method} = req;

    // GET /users - Read Users
    if(url === "/users" && method === "GET") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(userData));
    }

    // POST /user - Create User
    if(url === "/user" && method === "POST") {
        try{
            const newUser = await parseBody(req);
            newUser.id = userData.length ? userData[userData.length - 1].id + 1 : 1;
            userData.push(newUser);
            res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newUser));
        }catch(error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({message: "Invalid data"}));
        }
    }

    // PUT /user/:id - Update User
    if(url.startsWith('/user/') && method === "PUT") {
        const id = parseInt(url.split("/")[2]);
        const index = userData.findIndex(user => user.id === id);
        if(index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({message: "User not found"}));
        } else {
            try{
                const updatedUser = await parseBody(req);
                userData[index] = { ...userData[index], ...updatedUser};
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(userData[index]));
            }catch(error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({message: "Invalid data"}));
            }
        }
    }

    // DELETE /user/:id - Delete User
    if(url.startsWith('/user/') && method === "DELETE") {
        const id = parseInt(url.split("/")[2]);
        const index = userData.findIndex(user => user.id === id);
        if(index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({message: "User not found"}));
        } else {
            userData.splice(index, 1);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({message: "User deleted"}));
        }
    }

    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({message: "Route not found"}));
    }
});

server.listen(PORT, (error) => {
    error ? console.error(error) : console.log(`Server is running on port ${PORT}`);
})