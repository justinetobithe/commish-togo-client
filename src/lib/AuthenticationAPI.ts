import { api } from './api';
import User from '@/types/User';
import apiError from '@/lib/apiError';
import { useMutation } from '@tanstack/react-query';
import { RegisterInputs } from '@/app/(auth)/register/components/RegisterForm';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

export const login = async (
  email: string,
  password: string
): Promise<[LoginResponse | null, string | null]> => {
  try {
    const { data } = await api.post<LoginResponse>('/api/login', {
      email,
      password,
    });
    return [data, null];
  } catch (err) {
    return [null, apiError(err)];
  }
};

export const loginWithGoogle = async (
  provider: string = 'google',
  access_provider_token: string
): Promise<[LoginResponse | null, string | null]> => {
  try {
    const { data } = await api.post<LoginResponse>('/api/login/google', {
      provider,
      access_provider_token,
    });
    return [data, null];
  } catch (err) {
    return [null, apiError(err)];
  }
};

export const register = async (inputs: RegisterInputs): Promise<Response> => {
  const fd = new FormData();

  for (const key in inputs) {
    const value = inputs[key as keyof RegisterInputs];

    if (value !== undefined && value !== null) { 
      if (value instanceof File) {
        fd.append(key, value, value.name);
      } else {
        fd.append(key, value as string); 
      }
    }
  }

  const { data } = await api.post<Response>('/api/register', fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      inputs,
    }: {
      inputs: RegisterInputs;
    }): Promise<Response> => {
      return await register(inputs);
    },
    onSuccess: async (data: Response, { inputs }) => {
      toast({
        description: data.message,
        variant: 'success',
        duration: 1000,
      });

      setTimeout(async () => {
        const response = await signIn('credentials', {
          ...inputs,
          redirect: false,
        });
        if (response?.error) {
          toast({
            title: 'Uh oh! Something went wrong.',
            description: response.error,
            variant: 'destructive',
          });
        } else {
          // router.refresh();
          router.push('/login');
        }
      }, 1000);
    },
  });
};

export const logout = async () => {
  await api.post('/api/logout');
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      return await logout();
    },
    onSettled: () => {
      signOut({
        callbackUrl: '/login',
      });
    },
  });
};
