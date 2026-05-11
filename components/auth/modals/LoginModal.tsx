import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { mockLogin } from '@/src/lib/mockAuth';
import { useAuthStore } from '@/src/store/authStore';
import { useModalStore } from '@/src/store/modalStore';
import { Button } from '@/src/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginModal() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { closeModal, openCreateAccount } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await mockLogin(data.email, data.password);
      setUser(response.user, response.token);
      toast.success(`Welcome back, ${response.user.full_name}!`);
      closeModal();
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.success('Password reset link sent to your email!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-display font-black tracking-tighter uppercase">Welcome Back</h2>
        <p className="text-ink-secondary text-sm font-medium">Login to your Verity account</p>
      </div>

      <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                {...register('email')}
                type="email"
                placeholder="email@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
            {errors.email && <p className="text-[10px] text-status-fake font-bold">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Password</label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-primary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-status-fake font-bold">{errors.password.message}</p>}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-4 text-lg"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Login'}
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm text-ink-secondary">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => openCreateAccount()}
              className="text-primary font-bold hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
