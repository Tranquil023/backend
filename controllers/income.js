const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const addIncome = async (req, res) => {
    const { amount, income_type, description } = req.body;
    const user_id = req.user.id;
    const { data, error } = await supabase
        .from('income_records')
        .insert([{
            user_id,
            amount,
            income_type,
            description
        }]);

    if (error) return res.status(400).json({ error });
    return res.status(200).json({ message: "Income added", data });
};

const rechargeWallet = async (req, res) => {
    const { amount } = req.body;
    const user_id = req.user.id;
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ balance: supabase.raw('balance + ?', [amount]) })
            .eq('user_id', user_id)
            .select();

        if (error) return res.status(400).json({ error });
        return res.status(200).json({ message: "Wallet recharged", data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const investMoney = async (req, res) => {
    try {
        const { product, amount, dailyIncome, totalIncome, days } = req.body;
        const userId = req.user.id;

        const numericAmount = Number(amount);
        const numericDaily = Number(dailyIncome);
        const numericTotal = Number(totalIncome);
        const durationInMs = Number(days) * 24 * 60 * 60 * 1000;
        const endDate = new Date(Date.now() + durationInMs).toISOString();


        // 1️⃣ Fetch user balance
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            return res.status(400).json({ message: 'User not found or error fetching balance', userError });
        }

        const currentBalance = userData.balance;

        // 2️⃣ Check balance
        if (currentBalance < numericAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // 3️⃣ Deduct amount from balance
        const { error: updateError } = await supabase
            .from('users')
            .update({ balance: currentBalance - numericAmount })
            .eq('id', userId);

        if (updateError) {
            return res.status(400).json({ message: 'Failed to deduct balance', updateError });
        }

        // 4️⃣ Insert investment
        const { data, error: insertError } = await supabase
            .from('investments')
            .insert([{
                user_id: userId,
                product,
                amount: numericAmount,
                daily_income: numericDaily,
                total_income: numericTotal,
                end_date: endDate,
            }]);

        if (insertError) {
            return res.status(400).json({ message: 'Failed to create investment', insertError });
        }

        return res.status(200).json({ message: 'Investment successful', data });

    } catch (error) {
        console.error('Investment error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const addBankAccount = async (req, res) => {
    try {
        const userId = req.user.id; // from VerifyJWT
        const { account_name, account_no, bank_name, ifsc_code } = req.body;

        if (!account_name || !account_no || !bank_name || !ifsc_code) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('bank_details')
            .insert([{
                user_id: userId,
                account_name,
                account_number: account_no,
                bank_name,
                ifsc_code
            }])
            .select();

        if (error) return res.status(400).json({ message: "Failed to add bank account", error });

        return res.status(200).json({ message: "Bank account added successfully", data });
    } catch (error) {
        console.error("Add Bank Account Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getBankDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('bank_details')
            .select('*')
            .eq('user_id', userId)
             // fetch only one bank account

        if (error) {
            return res.status(400).json(error);
        }

        if (!data) {
            return res.status(200).json({ exists: false });
        }

        return res.status(200).json({ exists: true, account: data });
    } catch (err) {
        console.error('Error fetching bank details:', err);
        return res.status(500).json({ exists: false });
    }
};





module.exports = { addIncome, rechargeWallet, investMoney, addBankAccount, getBankDetails };
