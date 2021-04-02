const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const JWT_KEY = "lifeiswondeful";

const hashing = (value)=>{
  return new Promise((resolve,reject)=>{
      bcrypt.genSalt(10,(err,salt)=>{
          if(err){
              reject({
                  message:"Somenting went wrong inside hashing"
              })
          }
          bcrypt.hash(value,salt,(err,passwordHash)=>{
              if(err){
                  reject({
                      message:"Somenting went wrong inside hashing"
                  })
              }
              resolve(passwordHash)
          })
      })
  })
}

const hashCompare = (value,hashValue)=>{
  return new Promise( async (resolve,reject)=>{
      try {
          const bcryptValue = await bcrypt.compare(value,hashValue)
          resolve(bcryptValue)
      } catch (error) {
          reject(error)
      }
  })
}

const createJWT = async ({email,id,role})=>{
  return await JWT.sign(
      {email,id,role},
      JWT_KEY,
      {
          expiresIn:"48h"
      }
  )
}

const authenticate = (req,res,next)=>{
if(req.headers.authorization!==undefined){
  JWT.verify(req.headers.authorization, JWT_KEY,(err,decode)=>{
      if(decode!==undefined){
          next();
      }
      else{
          res.status(401).json({
              message:"invalid token!"
          });
      }
  });
}
else{
    res.status(401).json({message:"No token in headers!"});
}
}

module.exports = {hashing, hashCompare,createJWT, authenticate};