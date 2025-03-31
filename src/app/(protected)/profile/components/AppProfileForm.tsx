'use client';
import React, { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppSpinner from '@/components/AppSpinner';
import User from '@/types/User';
import { Profile } from '@/types/Profile';
import { useGetUserProfile, useCreateProfile, useUpdateProfile } from '@/lib/ProfileAPI';
import { Textarea } from '@/components/ui/textarea';
import CreatableSelect from 'react-select/creatable';
import { useQueryClient } from '@tanstack/react-query';

const inputSchema = z.object({
  user_id: z.number(),
  brief_description: z.string().optional().nullable(),  // ✅ Added brief_description field
  bio: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
  portfolio_url: z.string().optional().nullable(),
  hourly_rate: z.string().optional().nullable(),
  availability: z.string().optional().nullable(),
});

export type AppProfileFormInputs = z.infer<typeof inputSchema>;

const AppProfileForm: FC<{ user: User }> = ({ user }) => {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const { data } = useGetUserProfile(Number(user?.id));

  const { mutate: createProfile, isPending: isCreating } = useCreateProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const form = useForm<AppProfileFormInputs>({
    reValidateMode: 'onChange',
    resolver: zodResolver(inputSchema),
    defaultValues: {
      user_id: user?.id ? Number(user?.id) : undefined,
      brief_description: '',  // ✅ Added brief_description default value
      bio: '',
      skills: '',
      portfolio_url: '',
      hourly_rate: '',
      availability: '',
    },
  });

  useEffect(() => {
    if (data?.data) {
      const profileData = data?.data as unknown as Profile ?? null;
      setProfile(profileData);

      form.reset({
        user_id: Number(user?.id),
        brief_description: profileData?.brief_description || '',  // ✅ Added brief_description
        bio: profileData?.bio || '',
        skills: profileData?.skills || '',
        portfolio_url: profileData?.portfolio_url || '',
        hourly_rate: profileData?.hourly_rate || '',
        availability: profileData?.availability || '',
      });
    }
  }, [data, form, user.id]);

  const onSubmit = async (inputs: AppProfileFormInputs) => {
    setLoading(true);
    if (profile) {
      await updateProfile({ id: profile.id as number, profileData: inputs }, {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
      });
    } else {
      await createProfile(inputs, {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
      });
    }
    setLoading(false);
  };

  return (
    <Card className='mt-5 p-10'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='py-10'>
            <div className='grid gap-8'>

              {/* Brief Description */}
              <FormField control={form.control} name='brief_description' render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Write a brief overview..."
                      rows={4}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Bio */}
              <FormField control={form.control} name='bio' render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Write something about yourself..."
                      rows={6}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Skills */}
              <FormField control={form.control} name='skills' render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <CreatableSelect
                      {...field}
                      isMulti
                      value={field.value ? field.value.split(',').map((item) => ({
                        label: item.trim(),
                        value: item.trim(),
                      })) : []}
                      onChange={(selected) => {
                        field.onChange(selected.map((item) => item.value).join(','));
                      }}
                      placeholder="Add or create skills..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Portfolio URL */}
              <FormField control={form.control} name='portfolio_url' render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio URL</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Hourly Rate */}
              <FormField control={form.control} name='hourly_rate' render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Availability */}
              <FormField control={form.control} name='availability' render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            </div>

            <div className='mt-16 text-right'>
              <Button type="submit" variant="default" className="text-white" disabled={isCreating || isUpdating}>
                {loading ? <AppSpinner /> : ' Save Profile'}
              </Button>
            </div>

          </CardContent>
        </form>
      </Form>
    </Card>
  );
};

export default AppProfileForm;
