import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.log(`Error while hashing password: ${error}`);
    return "Error while hashing password";
  }
};
