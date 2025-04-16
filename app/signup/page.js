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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FloatingIcons from "@/components/floating-icons";
import Image from 'next/image'

import useUsers from "@/hooks/user.zustand";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  const [isSuccess] = useState(false);

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
     
        posts: 0,
        pagerank:0
      };

      // Simulate API call
      console.log("Sending data to API:", JSON.stringify(userData, null, 2));

      fetch("/api/createNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: ["USER"],
          properties: userData,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); // Parse JSON correctly
        })
        .then((data) => {
          setUser(data);
          router.push("/profile");
        })
        .catch((error) => console.error("Error:", error));

      // Simulate successful response

      setTimeout(() => {
        setIsSuccess(true);
        setTimeout(() => {
          //setUser(userData);
          setUser(userData);

          router.push("/profile");
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Error during signup:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      console.error("Invalid URL:", err);
      return false;
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
                Create Your Account
              </CardTitle>
              <CardDescription className="text-center mt-2">
                Join our community and start sharing
              </CardDescription>
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
                      className={`pr-10 ${
                        errors.username ? "border-destructive" : ""
                      }`}
                      placeholder="Choose a unique username"
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
                      className={`pr-10 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                      placeholder="Min 8 characters with numbers"
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
                      className={`pr-10 ${
                        errors.confirmPassword ? "border-destructive" : ""
                      }`}
                      placeholder="Confirm your password"
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
                      className={`pr-10 ${
                        errors.phone ? "border-destructive" : ""
                      }`}
                      placeholder="10-digit phone number"
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
                    Bio 
                  </Label>
                  <div className="relative">
                    <Input
                      id="bio"
                      name="bio"
                      type="text"
                      value={formData.bio}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.bio ? "border-destructive" : ""
                      }`}
                      placeholder="Describe yourself"
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
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Input
                      id="date"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.date ? "border-destructive" : ""
                      }`}
                      placeholder="Date of Birth"
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
                      className={`pr-10 ${
                        errors.email ? "border-destructive" : ""
                      }`}
                      placeholder="your@email.com"
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
                      placeholder="Upload your image and give its URL"
                      className={`pr-10 ${
                        errors.imageURL ? "border-destructive" : ""
                      }`}
                    />
                    {formData.imageURL && isValidURL(formData.imageURL) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-green-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <Image
                            src={formData.imageURL}
                            alt="Uploaded Image"
                            width={1000}
                            height={5000}
                            className="rounded-full"
                            unoptimized // Optional, if it's not from a trusted domain
                          />
                          {/* <Check size={14} /> Image got successfully */}
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
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
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

          <CardFooter className="flex justify-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => router.push("/login")}
              >
                Log in
              </Button>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
