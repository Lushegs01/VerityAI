import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useModalStore } from '@/src/store/modalStore';
import { Button } from '@/src/components/ui/Button';

const getStartedSchema = z.object({
  fullName: z.string().min(2, 'Full name is tool short'),
  email: z.string().email('Invalid email address'),
});

type GetStartedFormValues = z.infer<typeof getStartedSchema>;

export function GetStartedModal() {
  const [loading, setLoading] = useState(false);
  const { openLogin, openCreateAccount } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GetStartedFormValues>({
    resolver: zodResolver(getStartedSchema),
  });

  const onNext = async (data: GetStartedFormValues) => {
    setLoading(true);
    // Mock delay
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    
    openCreateAccount({ fullName: data.fullName, email: data.email });
    toast.success('Almost there! Set your password to continue', {
      icon: '🔐',
      duration: 3000
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-display font-black tracking-tighter uppercase">Get Started with Verity</h2>
        <p className="text-ink-secondary text-sm font-medium">Verify certificates in under 15 seconds</p>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-status-verified uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            No credit card required
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-status-verified uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            First verify free
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                {...register('fullName')}
                placeholder="Ada Lovelace"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
            {errors.fullName && <p className="text-[10px] text-status-fake font-bold">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                {...register('email')}
                type="email"
                placeholder="ada@verity.app"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
            {errors.email && <p className="text-[10px] text-status-fake font-bold">{errors.email.message}</p>}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-4 text-lg group"
          loading={loading}
        >
          Continue
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
