"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import bcrypt from "bcryptjs";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FloatingIcons from "@/components/floating-icons";

import useUsers from "@/hooks/user.zustand";

export default function EditProfile() {
    const user = useUsers((state) => state.selectedUser);
    console.log("User:",user);
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: user.name,
    password: "",
    confirmPassword: "",
    phone: user.phone,
    email: user.email,
    imageURL: user.imageURL,
    bio: user.bio	,
    dob: user.dob,
    gender: user.gender,
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
    imageURL: "",
    bio: "",
    dob: "",
    gender: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const setUser = useUsers((state) => state.setNewUser);
  
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else {
      newErrors.username = "";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
      valid = false;
    } else {
      newErrors.password = "";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    } else {
      newErrors.confirmPassword = "";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be a 10-digit number";
      valid = false;
    } else {
      newErrors.phone = "";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    } else {
      newErrors.email = "";
    }

    // Image URL validation
    if (!formData.imageURL) {
      newErrors.imageURL = "Profile image is required";
      valid = false;
    } else {
      newErrors.imageURL = "";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleImageUpload = (e) => {
  //   // In a real app, this would upload to a storage service
  //   // For this example, we'll just set the URL directly
  //   // const file = e.target.files[0];
  //   // if (file) {
  //   //   // Simulate upload and getting a URL back
  //   //   setTimeout(() => {
  //   //     const fakeUrl = `https://drive.google.com/fake-image-${Date.now()}.jpg`;
  //   //     setFormData((prev) => ({
  //   //       ...prev,
  //   //       imageURL: fakeUrl,
  //   //     }));
  //   //   }, 1000);
  //   // }
  //   //set;
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      // Prepare data for API call
      const userData = {
        name: formData.username,
        password: hashedPassword, // Send hashed password
        phone: formData.phone,
        email: formData.email,
        imageURL: formData.imageURL,
        dob: formData.dob,
        bio: formData.bio,

        //friendRequests: 0,  -> make edge instead
        //likedPosts: 0,  -> make edge instead
      };

      // Simulate API call
      console.log("Sending data to API:", userData);

      fetch("/api/updateNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: ["USER"],
          where:user,
          updates: userData,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); // Parse JSON correctly
        })
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));

      // Simulate successful response

      setTimeout(() => {
        setIsSuccess(true);
        setTimeout(() => {
          //setUser(userData);
          setUser({
            ...userData,
            followers: 0,
            following: 0,
            posts: 0,
          });

          router.push("/profile");
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Error during signup:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <FloatingIcons />
        
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-lg backdrop-blur-sm bg-background/80">
          <CardHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-center">
                Edit Details 
              </CardTitle>
              
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User size={16} />
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`pr-10 custom-placeholder ${errors.username ? "border-destructive" : ""}`}
                      placeholder= "Enter your name" 
                    />
                    {errors.username && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.username}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pr-10 custom-placeholder ${errors.password ? "border-destructive" : ""}`}
                      placeholder= "Enter your New password" 
                    />
                    {errors.password && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.password}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2"
                  >
                    <Lock size={16} />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pr-10 custom-placeholder ${errors.confirmPassword ? "border-destructive" : ""}`}
                      placeholder= "Confirm Password" 
                    />
                    {errors.confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.confirmPassword}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone size={16} />
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pr-10 custom-placeholder ${errors.phone ? "border-destructive" : ""}`}
                      placeholder= "Enter your phone number" 
                    />
                    {errors.phone && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.phone}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <div size={16} />
                    bio 
                  </Label>
                  <div className="relative">
                    <Input
                      id="bio"
                      name="bio"
                      type="text"
                      value={formData.bio}
                      onChange={handleChange}
                      className={`pr-10 custom-placeholder ${errors.bio ? "border-destructive" : ""}`}
                      placeholder= "Write about you" 
                    />
                    {errors.bio && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.bio}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <div size={16} />
                    date Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="date"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`pr-10 custom-placeholder ${errors.date ? "border-destructive" : ""}`}
                      placeholder= "Enter your dob" 
                    />
                    {errors.date && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.date}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pr-10 custom-placeholder ${errors.username ? "border-destructive" : ""}`}
                      placeholder= "Enter your email address" 
                    />
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.email}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="imageUpload"
                    className="flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Profile Image URL
                  </Label>
                  <div className="relative">
                    <Input
                      id="imageURL"
                      type="url"
                      name="imageURL"
                      // accept="image/*"
                      //onChange={handleImageUpload}
                      onChange={handleChange}
                      value={formData.imageURL}
                      className={`pr-10 custom-placeholder ${errors.imageURL ? "border-destructive" : ""}`}
                      placeholder= "Enter Image Url which will be your pfp"
                    />
                    {formData.imageURL && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-green-500 text-sm mt-1 flex items-center gap-1"
                      >
                        <Check size={14} /> Image got successfully
                      </motion.div>
                    )}
                    {errors.imageURL && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.imageURL}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
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
                    {isSubmitting ? "Creating Account..." : "Edit"}
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
                      <Check className="mr-2" size={16} /> Success!
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          
        </Card>
      </motion.div>
    </div>
  );
}
