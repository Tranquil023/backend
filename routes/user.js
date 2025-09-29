const express =require('express');
const { registerUser, loginUser} = require('../controllers/Auth');
const { rechargeWallet, addIncome, investMoney, addBankAccount, getBankDetails } = require('../controllers/income');
const { VerifyJWT } = require('../middleware/function');
const { getUserdetails, updateBankDetails } = require('../controllers/users');
const { withdrawMoney } = require('../controllers/withdrawal');

const router=express.Router();


router.post('/login',loginUser);
router.post('/register/:refCode', registerUser);
router.get('/me',VerifyJWT,getUserdetails);

router.post('/recharge-wallet', VerifyJWT, rechargeWallet);
router.post('/add-income', VerifyJWT, addIncome);
router.post('/invest-money',VerifyJWT,investMoney);
router.post('/withdraw',VerifyJWT,withdrawMoney)
router.post('/add-bank', VerifyJWT, addBankAccount);
router.get('/bank-details',VerifyJWT,getBankDetails);

router.post('/update-bank-details', VerifyJWT, updateBankDetails);

module.exports = router;