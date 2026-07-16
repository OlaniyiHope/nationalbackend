import DbPost from "../models/DbpostModel.js";
import DbCategory from "../models/DbbookCatModel.js";

export const createPost = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      isBreaking,
      isTrending,
      isFeatured,
      isEditorsPick,
    } = req.body;

    const toArray = (val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    };

    const tags = toArray(req.body.tags);

    const imageUrls = req.files?.images
      ? req.files.images.map((f) => f.location || f.filename)
      : [];

    const videoUrls = req.files?.videos
      ? req.files.videos.map((f) => f.location || f.filename)
      : [];
          // Video thumbnail
    const videoImageUrl = req.files?.videoImage
      ? req.files.videoImage[0].location || req.files.videoImage[0].filename
      : "";


    const newPost = await DbPost.create({
      title,
      excerpt,
      content,
      author,
      category: category || null,
      tags,
      images: imageUrls,
      videos: videoUrls,
       videoImage: videoImageUrl,
      isBreaking: isBreaking === "true",
      isTrending: isTrending === "true",
      isFeatured: isFeatured === "true",
      isEditorsPick: isEditorsPick === "true",
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("❌ Backend error creating post:", err);
    res.status(500).json({ message: err.message });
  }
};
export const getPosts = async (req, res) => {
  try {
    const posts = await DbPost.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await DbPost.findById(req.params.id)
      .populate({
        path: "category",
        populate: { path: "parent", populate: { path: "parent" } },
      })
      .lean();

    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await DbPost.findOne({ slug }).populate("category").lean();
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    console.error("Failed to fetch post by slug:", err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const updates = { ...req.body };

    let newImages = [];
    if (req.files && req.files["images"]) {
      const uploadedImages = Array.isArray(req.files["images"])
        ? req.files["images"]
        : [req.files["images"]];
      newImages = uploadedImages.map((file) => file.location || file.path);
    }

    let newVideos = [];
    if (req.files && req.files["videos"]) {
      const uploadedVideos = Array.isArray(req.files["videos"])
        ? req.files["videos"]
        : [req.files["videos"]];
      newVideos = uploadedVideos.map((file) => file.location || file.path);
    }

    if (newImages.length > 0) {
      updates.images = [
        ...(req.body.existingImages ? JSON.parse(req.body.existingImages) : []),
        ...newImages,
      ];
    }

    if (newVideos.length > 0) {
      updates.videos = [
        ...(req.body.existingVideos ? JSON.parse(req.body.existingVideos) : []),
        ...newVideos,
      ];
    }

    const updated = await DbPost.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating post:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    await DbPost.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const posts = await DbPost.find({ category: categoryId })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        let parentCategory = null;
        let grandParentCategory = null;

        if (post.category?.parent) {
          parentCategory = await DbCategory.findById(post.category.parent).lean();
          if (parentCategory?.parent) {
            grandParentCategory = await DbCategory.findById(parentCategory.parent).lean();
          }
        }

        return { ...post, parentCategory, grandParentCategory };
      })
    );

    res.json(enrichedPosts);
  } catch (err) {
    console.error("❌ Error fetching posts by category:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getBreakingPosts = async (req, res) => {
  try {
    const posts = await DbPost.find({ isBreaking: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const posts = await DbPost.find({ isTrending: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeaturedPosts = async (req, res) => {
  try {
    const posts = await DbPost.find({ isFeatured: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEditorsPickPosts = async (req, res) => {
  try {
    const posts = await DbPost.find({ isEditorsPick: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostsByTag = async (req, res) => {
  try {
    const posts = await DbPost.find({
      tags: { $in: [req.params.tag] },
    })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};