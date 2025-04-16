"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ImageIcon,
  FileText,
  Hash,
  Upload,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreatePost() {
  const [formData, setFormData] = useState({
    image: null,
    imageURL: "",
    description: "",
    hashtags: "",
  });

  const [errors, setErrors] = useState({
    image: "",
    description: "",
    hashtags: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Add animation effects for description
    if (name === "description" && value.length > 0) {
      // This would trigger animations in a real app
      console.log("Description being typed:", value);
    }

    // Format hashtags as user types
    if (name === "hashtags") {
      // Ensure hashtags start with #
      const formattedTags = value
        .split(" ")
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
        .join(" ");

      if (formattedTags !== value) {
        setFormData((prev) => ({
          ...prev,
          hashtags: formattedTags,
        }));
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Simulate upload to drive and getting back a URL
      setTimeout(() => {
        const fakeUrl = `https://drive.google.com/fake-post-image-${Date.now()}.jpg`;
        setFormData((prev) => ({
          ...prev,
          imageURL: fakeUrl,
        }));
      }, 1000);

      // Clear error
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imageURL: "",
    }));
    setPreviewUrl("");
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.image) {
      newErrors.image = "Post image is required";
      valid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare post data
      const postData = {
        imageURL: formData.imageURL,
        description: formData.description,
        hashtags: formData.hashtags
          .split(" ")
          .filter((tag) => tag.trim() !== ""),
      };

      // Simulate API call
      console.log("Sending post data to API:", postData);

      // Simulate successful response
      setTimeout(() => {
        setIsSuccess(true);
        setTimeout(() => {
          // Reset form after success
          setFormData({
            image: null,
            imageURL: "",
            description: "",
            hashtags: "",
          });
          setPreviewUrl("");
          setIsSuccess(false);
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2 shadow-lg">
      <CardHeader>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl font-bold text-center">
            Create New Post
          </CardTitle>
          <CardDescription className="text-center mt-2">
            Share your moments with the community
          </CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-2"
          >
            <Label htmlFor="postImage" className="flex items-center gap-2">
              <ImageIcon size={16} />
              Post Image
            </Label>

            {!previewUrl ? (
              <div
                className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => document.getElementById("postImage").click()}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload an image
                  </p>
                  <Input
                    id="postImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </motion.div>
              </div>
            ) : (
              <div className="relative rounded-md overflow-hidden">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Post preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={removeImage}
                >
                  <X size={16} />
                </Button>
              </div>
            )}

            {errors.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-destructive text-sm mt-1 flex items-center gap-1"
              >
                <X size={14} /> {errors.image}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-2"
          >
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText size={16} />
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write something about your post..."
              className={`min-h-24 ${
                errors.description ? "border-destructive" : ""
              }`}
            />

            {errors.description && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-destructive text-sm mt-1 flex items-center gap-1"
              >
                <X size={14} /> {errors.description}
              </motion.div>
            )}

            {/* Animated character count */}
            {formData.description && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground text-right"
              >
                {formData.description.length} characters
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-2"
          >
            <Label htmlFor="hashtags" className="flex items-center gap-2">
              <Hash size={16} />
              Hashtags
            </Label>
            <Input
              id="hashtags"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleChange}
              placeholder="Add hashtags separated by spaces"
            />

            {/* Hashtag preview */}
            {formData.hashtags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.hashtags
                  .split(" ")
                  .filter((tag) => tag.trim() !== "")
                  .map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </motion.span>
                  ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="pt-4"
          >
            <Button
              type="submit"
              className="w-full h-11 relative overflow-hidden group"
              disabled={isSubmitting || isSuccess}
            >
              <motion.span
                animate={isSuccess ? { y: -30 } : { y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2"
              >
                {isSubmitting ? "Creating Post..." : "Create Post"}
                {isSubmitting && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <Sparkles size={16} />
                  </motion.div>
                )}
              </motion.span>

              {isSuccess && (
                <motion.span
                  initial={{ y: 30 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center text-primary-foreground"
                >
                  <Check className="mr-2" size={16} /> Post Created!
                </motion.span>
              )}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
}
