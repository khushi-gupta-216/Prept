import jwt from "jsonwebtoken";

const genToken = (userId) => {
  try {
    if (!userId) {
      throw new Error("UserId is required");
    }

    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return token;

  } catch (error) {
    throw new Error("Token generation failed");
  }
};

export default genToken;