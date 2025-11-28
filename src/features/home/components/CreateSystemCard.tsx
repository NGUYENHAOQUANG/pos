import { colors, spacing, typography } from '@/styles';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BreedingAreaIcon, FarmIcon, PondIcon, SystemType } from './icons';

export interface CreateSystemCardProps {
  type: SystemType;
  onPress: () => void;
  containerStyle?: ViewStyle;
}

const CreateSystemCard: React.FC<CreateSystemCardProps> = ({ type, onPress, containerStyle }) => {
  const getTypeConfig = () => {
    switch (type) {
      case SystemType.BREEDING_AREA:
        return {
          title: 'Vùng nuôi',
          description: 'Khu vực nuôi rộng, bao gồm nhiều trại nuôi trong cùng một vùng.',
          iconColor: '#11B3B8',
          bgColor: '#EBF7FF',
          borderColor: 'rgba(17, 179, 184, 0.3)', // Light teal border with opacity
          buttonText: 'Tạo vùng nuôi',
        };
      case SystemType.FARM:
        return {
          title: 'Trại nuôi',
          description: 'Một cơ sở nuôi tôm gồm nhà trại, ao nuôi và hệ thống vận hành.',
          iconColor: '#FFA769',
          bgColor: '#FFE8DE',
          borderColor: 'rgba(255, 167, 105, 0.3)', // Light orange border with opacity
          buttonText: 'Tạo trại nuôi',
        };
      case SystemType.POND:
        return {
          title: 'Ao',
          description: 'Nơi chứa nước để thả và nuôi tôm, thuộc một phần của trại nuôi.',
          iconColor: '#0076F7',
          bgColor: '#EBF7FF',
          borderColor: 'rgba(0, 118, 247, 0.3)', // Light blue border with opacity
          buttonText: 'Tạo ao',
        };
    }
  };

  const typeConfig = getTypeConfig();

  const renderIcon = () => {
    switch (type) {
      case SystemType.BREEDING_AREA:
        return (
          <BreedingAreaIcon size={44} color={typeConfig.iconColor} bgColor={typeConfig.bgColor} />
        );
      case SystemType.FARM:
        return <FarmIcon size={44} color={typeConfig.iconColor} bgColor={typeConfig.bgColor} />;
      case SystemType.POND:
        return <PondIcon size={44} color={typeConfig.iconColor} bgColor={typeConfig.bgColor} />;
    }
  };

  return (
    <View style={[styles.card, { borderColor: typeConfig.borderColor }, containerStyle]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>{renderIcon()}</View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{typeConfig.title}</Text>
          <Text style={styles.description}>{typeConfig.description}</Text>

          {/* Button - aligned with text, not icon */}
          <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name="add" size={16} color={colors.white} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{typeConfig.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 36,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

export default CreateSystemCard;
