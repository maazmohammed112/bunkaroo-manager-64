import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/utils/supabase';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, LogIn } from 'lucide-react';

const SignIn = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      if (data?.user) {
        completeOnboarding({
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Student',
          usn: data.user.user_metadata?.usn || '',
          collegeName: data.user.user_metadata?.college_name || '',
          course: data.user.user_metadata?.course || '',
        });
      }

      toast({
        title: "Success",
        description: "Signed in successfully!",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign In Error:', error);
      toast({
        title: "Error",
        description: error?.message || "An error occurred during sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-[#7467E8]/20 transition-colors">
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
            <CardTitle className="text-2xl font-bold font-display text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-[#666675] dark:text-[#9292A2] text-xs">
              Sign in to your BunkBuddy cloud account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Email</label>
                <Input
                  type="email"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full font-bold py-6 rounded-[18px] shadow-md shadow-[#7467E8]/20 gap-2 mt-2"
                disabled={loading}
              >
                <LogIn size={16} strokeWidth={2} />
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t border-[#E8E7EF] dark:border-white/[0.08] pt-4">
            <div className="text-xs text-[#666675] dark:text-[#9292A2] text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#7467E8] hover:underline font-bold">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignIn;