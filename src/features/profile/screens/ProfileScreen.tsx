/**
 * @file ProfileScreen.tsx
 * @description ProfileScreen - Container component
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-11-17 - Updated to use ANTD-RN spacing components
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeArea, Container, Button, WhiteSpace} from '@/shared/components';
import {useAuth} from '@/features/auth';
import {typography} from '@/styles/typography';
import {colors} from '@/styles/colors';

export function ProfileScreen() {
  const {user, logout} = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeArea>
      <Container>
        <WhiteSpace size="lg" />
        <Text style={styles.title}>Profile</Text>
        <WhiteSpace size="lg" />
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <WhiteSpace size="xs" />
            <Text style={styles.userPhone}>{user.phone}</Text>
          </View>
        )}
        <WhiteSpace size="xl" />
        <Button title="Logout" onPress={handleLogout} variant="outline" />
      </Container>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  userInfo: {
    // Spacing handled by WhiteSpace components
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  userPhone: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});
