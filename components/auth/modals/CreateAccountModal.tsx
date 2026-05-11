import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { mockRegister } from '@/src/lib/mockAuth';
import { useAuthStore } from '@/src/store/authStore';
import { useModalStore } from '@/src/store/modalStore';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

const createAccountSchema = z.object({
  fullName: z.string().min(2, 'Full name is too short'),
  companyName: z.string().min(2, 'Company name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export function CreateAccountModal() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { closeModal, openLogin, prefillData } = useModalStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      fullName: prefillData.fullName,
      email: prefillData.email,
    }
  });

  const passwordValue = watch('password', '');

  const passwordStrength = useMemo(() => {
    if (!passwordValue) return null;
    if (passwordValue.length < 6) return { label: 'Weak', color: 'bg-status-fake', text: 'text-status-fake' };
    if (passwordValue.length < 10) return { label: 'Fair', color: 'bg-status-suspicious', text: 'text-status-suspicious' };
    return { label: 'Strong', color: 'bg-status-verified', text: 'text-status-verified' };
  }, [passwordValue]);

  const onRegister = async (data: CreateAccountFormValues) => {
    setLoading(true);
    try {
      const response = await mockRegister({
        fullName: data.fullName,
        companyName: data.companyName,
        email: data.email,
        password: data.password
      });
      setUser(response.user, response.token);
      toast.success('Account created successfully!');
      closeModal();
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-display font-black tracking-tighter uppercase">Create Your Account</h2>
        <p className="text-ink-secondary text-sm font-medium">Join 1,200+ employers verifying smarter</p>
      </div>

      <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                {...register('fullName')}
                placeholder="Ada Lovelace"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm"
              />
            </div>
            {errors.fullName && <p className="text-[10px] text-status-fake font-bold">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Company</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                {...register('companyName')}
                placeholder="Future Tech"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm"
              />
            </div>
            {errors.companyName && <p className="text-[10px] text-status-fake font-bold">{errors.companyName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              {...register('email')}
              type="email"
              placeholder="ada@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm"
            />
          </div>
          {errors.email && <p className="text-[10px] text-status-fake font-bold">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary outline-none transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordStrength && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-surface-base rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-300", passwordStrength.color, 
                    passwordStrength.label === 'Weak' ? 'w-1/3' : 
                    passwordStrength.label === 'Fair' ? 'w-2/3' : 'w-full'
                  )} />
                </div>
                <span className={cn("text-[8px] font-bold uppercase tracking-wider", passwordStrength.text)}>{passwordStrength.label}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Confirm</label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary outline-none transition-all font-medium text-sm"
            />
          </div>
        </div>
        {(errors.password || errors.confirmPassword) && (
          <p className="text-[10px] text-status-fake font-bold">
            {errors.password?.message || errors.confirmPassword?.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full py-4 text-lg mt-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm text-ink-secondary">
            Already have an account?{' '}
            <button
              type="button"
              onClick={openLogin}
              className="text-primary font-bold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
