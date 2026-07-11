const fs = require("fs");

const FILE = "./data/users.json";

function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync(FILE));
    } catch {
        return {};
    }
}

function saveUsers(users) {
    fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

module.exports = {
    loadUsers,
    saveUsers
};
