/**
 * @file LoginForm.tsx
 * @description LoginForm component
 * @author Kindy
 * @created 2025-11-16
 */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Input, Button} from '@/shared/components';
import {useAuth} from '../hooks/useAuth';
import {phoneSchema} from '@/shared/utils/validation';
import {spacing} from '@/styles/spacing';

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({onSuccess}: LoginFormProps) {
  const {login, loading} = useAuth();
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Demo: Mock login - không call API
      // Simulate login success
      await new Promise(resolve => setTimeout(resolve, 1000));
      await login(data);
      onSuccess?.();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="phone"
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            autoCapitalize="none"
            keyboardType="phone-pad"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.phone?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Button
        title="Login"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
});

