export const createPost = async (req, res) => {
  try {
    const userProfileId = req.user.profile._id;
    // const { content, }
  } catch (error) {
    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while creating post",
    });
  }
};
