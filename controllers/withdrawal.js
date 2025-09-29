// controllers/withdraw.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const withdrawMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    currentBalance = req.user;
    console.log(currentBalance)

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Example: 10% tax
    const tax = numericAmount * 0.10;
    const netAmount = numericAmount - tax;

    // Optional: Check if user has bank account
    const { data: bankAccount, error: bankError } = await supabase
      .from('bank_details')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (bankError || !bankAccount) {
      return res.status(400).json({ message: 'Bank account not found' });
    }

    const { data, error: insertError } = await supabase
      .from('withdrawals')
      .insert([
        {
          user_id: userId,
          bank_account_id: bankAccount.id,
          amount: numericAmount,
          tax,
          net_amount: netAmount,
          status: 'pending',
        },
      ]);

    if (insertError) {
      return res.status(400).json({ message: 'Failed to record withdrawal', insertError });
    }

    // 1. Fetch current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Fetch error:', userError);
    } else {
      const currentBalance = user.balance;
      const newBalance = currentBalance - amount;

      // 2. Update balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (updateError) {
        console.error('Update error:', updateError);
      } else {
        // console.log('Balance updated successfully');
      }
    }


    return res.status(200).json({ message: 'Withdrawal request submitted', data });

  } catch (error) {
    console.error('Withdrawal error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


module.exports = { withdrawMoney }
