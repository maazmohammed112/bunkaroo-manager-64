import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/utils/supabase';
import { ArrowLeft, UserPlus } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    usn: '',
    collegeName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            usn: formData.usn,
            college_name: formData.collegeName
          }
        }
      });

      if (authError) throw authError;

      toast({
        title: "Success",
        description: "Account created successfully! Please sign in with your credentials.",
      });

      navigate('/signin');
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      toast({
        title: "Error",
        description: error?.message || "An error occurred during sign up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex-1 bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-[#7467E8]/20 transition-colors overflow-x-clip">
      <div className="w-full max-w-md mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-[#666675] dark:text-[#9292A2] hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-4 sm:p-6 rounded-[28px]">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-[#111218] p-2 flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10">
              <img 
                src="/logo.png" 
                alt="BunkBuddy Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <CardTitle className="text-2xl font-bold font-display text-foreground">Create an Account</CardTitle>
            <CardDescription className="text-[#666675] dark:text-[#9292A2] text-xs">
              Enter your details to create your BunkBuddy cloud account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Full Name</label>
                <Input
                  type="text"
                  placeholder="Mohammed Maaz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">USN / Roll No</label>
                  <Input
                    type="text"
                    placeholder="1XX20CS001"
                    value={formData.usn}
                    onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                    className="uppercase"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">College Name</label>
                  <Input
                    type="text"
                    placeholder="Institute of Tech"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Email Address</label>
                <Input
                  type="email"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Confirm</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full font-bold py-6 rounded-[18px] shadow-md shadow-[#7467E8]/20 gap-2 mt-2"
                disabled={loading}
              >
                <UserPlus size={16} strokeWidth={2} />
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t border-[#E8E7EF] dark:border-white/[0.08] pt-4">
            <div className="text-xs text-[#666675] dark:text-[#9292A2] text-center">
              Already have an account?{' '}
              <Link to="/signin" className="text-[#7467E8] hover:underline font-bold">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUp;