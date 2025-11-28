/**
 * @file ProductDetailScreen.tsx
 * @description ProductDetailScreen - Product detail view
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-11-17 - Updated to use ANTD-RN spacing components
 */
import React from 'react';
import {Text, StyleSheet, ScrollView} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {SafeArea, Container, WhiteSpace} from '@/shared/components';
import {typography} from '@/styles/typography';
import {colors} from '@/styles/colors';

type ProductDetailRouteProp = RouteProp<{ProductDetail: {id: string}}, 'ProductDetail'>;

export function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const {id} = route.params;

  return (
    <SafeArea>
      <ScrollView style={styles.scrollView}>
        <Container>
          <WhiteSpace size="lg" />
          <Text style={styles.title}>Chi Tiết Sản Phẩm</Text>
          <WhiteSpace size="sm" />
          <Text style={styles.subtitle}>Product ID: {id}</Text>
          <WhiteSpace size="md" />
          <Text style={styles.description}>
            Đây là trang chi tiết sản phẩm. Bạn có thể thêm thông tin chi tiết về sản phẩm ở đây.
          </Text>
        </Container>
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
