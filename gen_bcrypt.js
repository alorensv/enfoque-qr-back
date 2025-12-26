const bcrypt = require('bcryptjs');
const password = 'qweasdqwe';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hash para qweasdqwe:', hash);
});
