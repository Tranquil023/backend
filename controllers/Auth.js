const { createClient } = require('@supabase/supabase-js');
// const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { generateAuthToken } = require('../middleware/function');

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const registerUser = async (req, res) => {
  try {
    const { full_name, phone, withdrawal_password, password } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert([{ full_name, phone, password, withdrawal_password }])
      .select();

    if (error) throw error;
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !data) throw new Error('User not found');

    if (data.password !== password) {
      throw new Error('Invalid password');
    }

    const token = generateAuthToken(data);

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



module.exports = { registerUser, loginUser};