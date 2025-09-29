const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);


const getUserdetails = async (req,res)=>{
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        res.json({ message: 'User details fetched', data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const generateReferLink = async (req, res) => {
  try {
    const { userId } = req.body;

    const referLink = `${process.env.APP_URL}/register?ref=${userId}`;

    res.json({ message: 'Refer link generated', referLink });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const updateBankDetails = async (req, res) => {
  try {
    const { user_id, account_number, ifsc_code, bank_name, account_holder_name } = req.body;
    const { data, error } = await supabase
      .from('bank_details')
      .upsert({ user_id, account_number, ifsc_code, bank_name, account_holder_name })
      .select();

    if (error) throw error;
    res.json({ message: 'Bank details updated', data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {getUserdetails, generateReferLink, updateBankDetails};