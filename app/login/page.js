"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Sparkles, Check } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloatingIcons from "@/components/floating-icons";

import useUsers from "@/hooks/user.zustand";
import bcrypt from "bcryptjs";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState("username");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const setNewUser = useUsers((state) => state.setNewUser);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (loginMethod === "username" && !formData.username) {
      setError("Username is required");
      return;
    }

    if (loginMethod === "email" && !formData.email) {
      setError("Email is required");
      return;
    }

    if (loginMethod === "phone" && !formData.phone) {
      setError("Phone number is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare login data based on selected method
      const loginData = {
        password: formData.password,
      };

      if (loginMethod === "username") {
        loginData.username = formData.username;
      } else if (loginMethod === "email") {
        loginData.email = formData.email;
      } else if (loginMethod === "phone") {
        loginData.phone = formData.phone;
      }

      console.log("Sending login data:", loginData);

      // Call the API to fetch user data
      const response = await fetch("/api/getNodeByLabel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: ["USER"],
          where:
            loginMethod === "username"
              ? { name: formData.username }
              : loginMethod === "email"
              ? { email: formData.email }
              : { phone: formData.phone },
          
        }),
      }); 

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.length === 0) {
        alert("No User Found");
        return;
      }

      const user = data[0].n.properties;

      console.log("User data:", user);

      // Check if password is correct using bcrypt
      const isPasswordValid = await bcrypt.compare(
        formData.password,
        user.password
      );

      if (!isPasswordValid) {
        //throw new Error("Invalid credentials. Please try again.");
      }

      // Set user data to Zustand
      setNewUser(user);
      setIsSuccess(true);

      // Redirect to profile after success
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error) {
      //console.error("Login error:", error);
      setError( "Invalid credentials. Please try again.",error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login min-h-screen flex items-center justify-center p-4">
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
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center mt-2">
                Log in to your account
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Tabs
                  defaultValue="username"
                  value={loginMethod}
                  onValueChange={setLoginMethod}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger
                      value="username"
                      className="flex items-center gap-1"
                    >
                      <User size={14} /> Username
                    </TabsTrigger>
                    <TabsTrigger
                      value="email"
                      className="flex items-center gap-1"
                    >
                      <Mail size={14} /> Email
                    </TabsTrigger>
                    <TabsTrigger
                      value="phone"
                      className="flex items-center gap-1"
                    >
                      <Phone size={14} /> Phone
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    {loginMethod === "username" && (
                      <TabsContent value="username" className="mt-0">
                        <motion.div
                          key="username-input" // Unique key for username tab
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label
                            htmlFor="username"
                            className="flex items-center gap-2"
                          >
                            <User size={16} />
                            Username
                          </Label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                          />
                        </motion.div>
                      </TabsContent>
                    )}

                    {loginMethod === "email" && (
                      <TabsContent value="email" className="mt-0">
                        <motion.div
                          key="email-input" // Unique key for email tab
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <Mail size={16} />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                          />
                        </motion.div>
                      </TabsContent>
                    )}

                    {loginMethod === "phone" && (
                      <TabsContent value="phone" className="mt-0">
                        <motion.div
                          key="phone-input" // Unique key for phone tab
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label
                            htmlFor="phone"
                            className="flex items-center gap-2"
                          >
                            <Phone size={16} />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                          />
                        </motion.div>
                      </TabsContent>
                    )}
                  </AnimatePresence>
                </Tabs>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </Label>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
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
                    {isSubmitting ? "Logging in..." : "Log In"}
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
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              Don t have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => router.push("/signup")}
              >
                Sign up
              </Button>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
