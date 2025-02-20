var express = require('express');
var router = express.Router();
const {getVaccinesByBrand , registerViolations, getVaccineHistory, addVaccine, getVaccine, transferOwner, registerUser, requestTransfer}= require("../application/vaccine.js")
var requireAuth = require('../application/middleWare');
const session = require('express-session');

router.use(session({
    secret: 'FIJNWEIFWIEBISDNFIWEBFIWE', 
    resave: false,
    saveUninitialized: true
  }));


router.get('/:vaccine_id', requireAuth, async function(req, res, next) {
    const result = await getVaccine(req.params.vaccine_id);
    res.json(result);
});

router.get('/brand/:brand', requireAuth, async function(req, res, next) {
    const brand = req.params.brand;
    const result = await getVaccinesByBrand(brand);
    res.json(result);
  });


router.get('/history/:vaccine_id', requireAuth, async function(req, res) {
    const result = await getVaccineHistory(req.params.vaccine_id)
    res.json(result);
});

router.post('/', requireAuth,  async function(req, res){
    const{vaccine} = req.body
    console.log(vaccine)
    await addVaccine(vaccine)
    res.status(200).json(await getVaccineHistory(vaccine.vaccineId))
});

router.post('/violation', requireAuth, async function(req, res){
    try {
        const { vaccine_id, violations } = req.body;

        if (!vaccine_id || !violations) {
        return res.status(400).json({ error: 'Invalid request body format' });
        }
        
        const result = registerViolations(vaccine_id, violations);
        
        res.status(200).json(result);

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/transfer', requireAuth, async function(req, res){
    try{
        const { vaccine_id } = req.body;
        await transferOwner(vaccine_id, req.session.username);
        const result = await getVaccine(vaccine_id);
        res.status(200).json(result);
    }
    catch(error){
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/register', requireAuth, async function(req, res){
    try{
        if(req.session.username != 'admin')
            return res.status(400).json({error:'Not authorized, only admin has access'});

        const {user_id} = req.body;
        await registerUser(user_id);
        res.status(200).json({message : 'Succesfully registered user'});
    }
    catch(error){
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/request', requireAuth, async function(req, res){
    try{
        const { vaccine_id } = req.body;
        await requestTransfer(vaccine_id, req.session.username);
        const result = await getVaccine(vaccine_id);
        res.status(200).json(result);
    }
    catch(error){
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;