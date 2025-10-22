const express =require('express');
const { registerUser, loginUser} = require('../controllers/Auth');
const { rechargeWallet, addIncome, investMoney, addBankAccount, getBankDetails, addIncomeRecord } = require('../controllers/income');
const { VerifyJWT } = require('../middleware/function');
const { getUserdetails, updateBankDetails, RechargeRecords } = require('../controllers/users');
const { withdrawMoney, getWithdrawalsRecords, getIncomeRecords } = require('../controllers/withdrawal');

const router=express.Router();


router.post('/login',loginUser);
router.post('/register/:refCode', registerUser);
router.get('/me',VerifyJWT,getUserdetails);

router.post('/recharge-wallet', VerifyJWT, rechargeWallet);
router.post('/recharge-records', VerifyJWT, RechargeRecords);

router.post('/add-income', VerifyJWT, addIncome);
router.post('/invest-money',VerifyJWT,investMoney);
router.post('/withdraw',VerifyJWT,withdrawMoney)
router.post('/add-bank', VerifyJWT, addBankAccount);
router.get('/bank-details',VerifyJWT,getBankDetails);

router.get('/withdraw-Records',VerifyJWT,getWithdrawalsRecords);
router.get('/income-Records',VerifyJWT,getIncomeRecords);

router.post('/add-income-record', VerifyJWT, addIncomeRecord);  


router.post('/update-bank-details', VerifyJWT, updateBankDetails);

module.exports = router;