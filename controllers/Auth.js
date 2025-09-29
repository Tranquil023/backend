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
    const { full_name, phone, password, withdrawal_password } = req.body;
    const { refCode } = req.params; // ✅ Correctly extracting the param

    // ✅ 1. Validate inputs
    if (!full_name || !phone || !password || !withdrawal_password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ 2. Check if phone is already used
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // ✅ 3. Validate referral code
    let referred_by = null;
    if (refCode) {
      const { data: refUser } = await supabase
        .from('users')
        .select('referral_code')
        .eq('referral_code', refCode)
        .single();

      if (!refUser) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
      referred_by = refCode;
    }

    // ✅ 5. Generate unique referral_code for the new user
    const generateReferralCode = () =>
      Math.random().toString(36).substr(2, 6).toUpperCase();

    let newReferralCode;
    let isUnique = false;

    while (!isUnique) {
      newReferralCode = generateReferralCode();
      const { data: codeExists } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', newReferralCode)
        .single();

      if (!codeExists) isUnique = true;
    }

    // ✅ 6. Insert the new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          full_name,
          phone,
          password,
          withdrawal_password,
          referral_code: newReferralCode,
          referred_by, // Set only if refCode is valid
        },
      ])
      .select();

    if (error) throw error;

    res.json({ message: 'User registered successfully', user: data[0] });

  } catch (err) {
    res.status(400).json({ error: err.message || 'Something went wrong' });
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



module.exports = { registerUser, loginUser };