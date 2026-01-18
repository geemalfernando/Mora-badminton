const { uploadFile } = require("../util/uploadFile");
const databaseWrapper = require("../database/databaseWrapper");


const uploadImage = async (req,res) => {
    const {image,playerId} = req?.body;
    if(!image || !playerId ){
        return res.status(400).send({message: "required fields are not set"});
    }

    try{
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 8);
        const hashString = playerId + '_' + timestamp +  randomString;
        console.log('name',hashString);
        console.log('Uploading image...,',playerId);
        const url = await uploadFile(`profile_pictures`,image,hashString);
        console.log('url',url);
        const updateForm = {
            photo: url
        };
        return await databaseWrapper.update("player", "_id", playerId, updateForm, res);
    }catch(e){
        return res.status(400).send({msg:'internal server error', error: e.message});
    }
       
}

const uploadMultipleFiles = async (req,res) => {
    console.log('uploading multiple files...');
    const {
        images,
        playerIds,
        slip,
        companyId,
        entityId,
        entityType
    } = req?.body;
    
    if(!images || !playerIds ){
        return res.status(400).send({message: "required fields are not set"});
    }

    try{

        const count = images.length;
        if(images.length !== count || playerIds.length !== count){
            return res.status(400).send({message: "data do not have same length"});
        }

        for(let i = 0; i < count; i ++ ){
            if(images[i] === null){
                continue;
            }
            const playerId = playerIds[i];
            const image = images[i]
            const timestamp = new Date().getTime();
            const randomString = Math.random().toString(36).substring(2, 8);
            const hashString = playerId + '_' + timestamp +  randomString;
            const url = await uploadFile(`profile_pictures`,image,hashString);
            console.log('url',url);
            const updateForm = {
                photo: url
            };

            
            const isSuccess = await databaseWrapper.updateWithoutReturn("player", "_id", playerId, updateForm);
            if(!isSuccess) {
                return res.status(400).send({msg:'internal server error'});
            }
            
        }

        if(!slip){
            return res.status(200).send({message: 'photo uploaded successfully'});
        }

        const targetId = entityId || companyId;
        if (!targetId) {
            return res.status(400).send({ message: "entityId is required when slip is provided" });
        }
        
        const slipTimestamp = new Date().getTime();
        const slipRandomString = Math.random().toString(36).substring(2, 8);
        const slipHashString = targetId + '_' + slipTimestamp +  slipRandomString;
        const slipUrl = await uploadFile('payment_slips', slip, slipHashString);

        const normalizedType = String(entityType || 'company').toLowerCase();
        const primaryCollection = normalizedType === 'university' ? 'university' : 'company';
        const secondaryCollection = primaryCollection === 'company' ? 'university' : 'company';

        let slipUpdate = await databaseWrapper.updateWithoutReturn(primaryCollection, "_id", targetId, { paymentSlip: slipUrl });
        if (!slipUpdate && !entityType) {
            slipUpdate = await databaseWrapper.updateWithoutReturn(secondaryCollection, "_id", targetId, { paymentSlip: slipUrl });
        }

        if(!slipUpdate) {
            return res.status(400).send({msg:'internal server error', message: 'Could not attach payment slip'});
        }
        return res.status(200).send({message: 'photo uploaded successfully'});
    }catch(e){
        console.log('error',e);
        return res.status(400).send({msg:'internal server error', error: e.message});
    }
       
}



module.exports = {
    uploadImage,
    uploadMultipleFiles
}
