import bcrypt from 'bcryptjs';

const users = [
  { id: 1, email: 'admin', password: bcrypt.hashSync('pass', 10), isAdmin: true },
  { id: 2, email: 'user', password: bcrypt.hashSync('pass', 10), isAdmin: false }
];

function listUsers() {
  return users.map(({ id, email, isAdmin }) => ({ id, email, isAdmin }));
}

function findByEmail(email) {
  return users.find(u => u.email === email);
}

function findById(id) {
  return users.find(u => u.id === Number(id));
}

async function addUser(email, password, isAdmin = false) {
  const hashed = await bcrypt.hash(password, 10);
  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const user = { id, email, password: hashed, isAdmin };
  users.push(user);
  return { id, email, isAdmin };
}

async function updatePassword(id, password) {
  const user = findById(id);
  if (!user) return false;
  user.password = await bcrypt.hash(password, 10);
  return true;
}

function removeUser(id) {
  const idx = users.findIndex(u => u.id === Number(id));
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}

export { listUsers, findByEmail, addUser, updatePassword, removeUser };
