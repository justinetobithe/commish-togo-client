'use client';
import React, { FC, useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useRegister } from '@/lib/AuthenticationAPI';
import AppSpinner from '@/components/AppSpinner';
import { strings } from '@/utils/strings';
import { Checkbox } from "@/components/ui/checkbox"
import AppConfirmationDialog from '@/components/AppConfirmationDialog';

const inputSchema = z.object({
  first_name: z.string().min(3, strings.validation.required),
  last_name: z.string().min(3, strings.validation.required),
  email: z.string().email(),
  phone: z.string(),
  student_id: z.string().optional(),
  password: z.string().min(6, strings.validation.password_min_characters).optional(),
  password_confirmation: z.string().min(6, strings.validation.password_min_characters).optional(),
  role: z.string().optional(),
});

export type RegisterInputs = z.infer<typeof inputSchema>;

const RegisterForm: FC = () => {
  const form = useForm<RegisterInputs>({
    resolver: zodResolver(inputSchema),
    defaultValues: { role: 'user' },
  });

  const [privacyChecked, setPrivacyChecked] = useState(false);
  const { mutate, isPending } = useRegister();

  const onSubmit = async (inputs: RegisterInputs) => {
    if (!privacyChecked) return;
    mutate({ inputs });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <h4 className='text-center text-2xl font-bold'>Create your account</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name='first_name' render={({ field }) => (
            <FormItem>
              <FormLabel className='font-medium'>First Name</FormLabel>
              <FormControl>
                <Input type='text' {...field} className='border-border focus-visible:ring-offset-0' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name='last_name' render={({ field }) => (
            <FormItem>
              <FormLabel className='font-medium'>Last Name</FormLabel>
              <FormControl>
                <Input type='text' {...field} className='border-border focus-visible:ring-offset-0' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name='email' render={({ field }) => (
            <FormItem>
              <FormLabel className='font-medium'>Email Address</FormLabel>
              <FormControl>
                <Input type='email' {...field} className='border-border focus-visible:ring-offset-0' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name='phone' render={({ field }) => (
            <FormItem>
              <FormLabel className='font-medium'>Contact Number</FormLabel>
              <FormControl>
                <Input type='text' {...field} className='border-border focus-visible:ring-offset-0' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} /> 
        </div>
        
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='privacy'
            checked={privacyChecked}
            onCheckedChange={(checked) => setPrivacyChecked(checked === true)}
          />

          <AppConfirmationDialog
            title="Privacy Policy"
            description={
              <div className="text-sm leading-relaxed text-justify space-y-2">
                <p>
                  By signing up, you acknowledge and agree to our Privacy Policy. We collect and process your
                  personal information to provide you with access to our services, improve your user experience,
                  and comply with legal obligations.
                </p>
                <p>
                  Your data may be used for account management, customer support, and personalized communications.
                  We do not share your personal information with third parties without your consent, except as
                  required by law or for necessary service provisions.
                </p>
                <p>
                  You have the right to access, update, and delete your data at any time. For more details, please
                  review our full Privacy Policy.
                </p>
              </div>
            }
            buttonElem={
              <label htmlFor="privacy" className="text-sm cursor-pointer text-blue-600 underline">
                I agree to the Privacy Policy.
              </label>
            }
          />
        </div>

        <Button type='submit' variant='default' className='block w-full font-semibold' disabled={isPending}>
          {isPending ? <AppSpinner className='mx-auto' /> : 'Sign Up'}
        </Button>
      </form>
    </Form >
  );
};

export default RegisterForm;
