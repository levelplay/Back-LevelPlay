import {compare, hash} from 'bcrypt';
import {envVariables} from "./env-variables";
const generatePassword = (text:string) => {
  return hash(text,  parseInt(envVariables.salt));
};

const comparePassword = (password:string, hash: string) => {
  return compare(password, hash);
};

function generateOTP(count: number) {

  // Declare a string variable
  // which stores all string
  const string = '0123456789';
  let OTP = '';

  // Find the length of string
  const len = string.length;
  for (let i = 0; i < count; i++ ) {
    OTP += string[Math.floor(Math.random() * len)];
  }
  return OTP;
}

export {
  generatePassword,
  generateOTP,
};

