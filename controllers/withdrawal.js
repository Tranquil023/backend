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
    const currentBalance = req.user.withdrawal_balance;
    const recharge_balance = req.user.recharge_balance;
    console.log(req.user);

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

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
      .select('withdrawal_balance')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Fetch error:', userError);
    } else {
      const currentBalance = user.withdrawal_balance;
      const newBalance = currentBalance - amount;
      const balance = req.user.balance-amount || 0;

      // 2. Update balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ withdrawal_balance: newBalance,
          // balance:balance
         })
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

const getWithdrawalsRecords = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ message: 'Error fetching withdrawal records', error });
    }

    return res.status(200).json({ message: 'Withdrawal records fetched successfully', data });
  } catch (error) {
    console.error('Error fetching withdrawal records:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getIncomeRecords = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { data, error } = await supabase
      .from('income_records')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ message: 'Error fetching income records', error });
    }

    return res.status(200).json({ message: 'Income records fetched successfully', data });
  } catch (error) {
    console.error('Error fetching income records:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { withdrawMoney, getWithdrawalsRecords, getIncomeRecords };
