import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useMenuContext } from '@/features/menu/context/MenuContext';

// Components
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { HeadingMenu } from '@/features/menu/components/HeadingMenu';
import { EmptyStateCard } from '@/features/menu/components/EmptyStateCard';
import { DropDownButton } from '@/features/menu/components/aquaculture/DropDownButton';
import { AquacultureItem } from '@/features/menu/components/aquaculture/AquacultureItem';

export const AquacultureManagementScreens: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setTabBarVisible } = useTabBarVisibility();
  const { aquacultures } = useMenuContext();
  const [selectedTab, setSelectedTab] = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      const timeout = setTimeout(() => {
        setTabBarVisible(false);
      }, 100);

      return () => {
        clearTimeout(timeout);
        setTabBarVisible(true);
      };
    }, [setTabBarVisible])
  );

  // Mock data for dropdown
  const farmOptions = [
    { id: '1', label: 'Trại Kiên Giang' },
    { id: '2', label: 'Trại Cà Mau' },
  ];

  // Filter logic (optional, for now show all)
  const filteredList = aquacultures; // Can implement tab filtering if needed

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <HeaderMenu
        title="Quản lý vụ nuôi"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddAquaculture')}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <HeadingMenu
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
        counts={{ all: aquacultures.length, active: 0, ended: 0 }} // Simple count for now
      />

      {/* Dropdown Filter Section (White Background) */}
      <View style={styles.filterSection}>
        <DropDownButton
          data={farmOptions}
          value={farmOptions[0]}
          onSelect={item => console.log('Selected:', item)}
        />
      </View>

      <View style={styles.content}>
        {aquacultures.length === 0 ? (
          /* Empty State */
          <View style={styles.cardContainer}>
            <EmptyStateCard
              message="Chưa có vụ nuôi nào"
              buttonTitle="Tạo vụ nuôi"
              onPress={() => navigation.navigate('AddAquaculture')}
            />
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <AquacultureItem
                item={item}
                onEdit={editItem =>
                  navigation.navigate('EditAquaculture', { aquaculture: editItem })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
    padding: 0, // Removed padding to let items fill width
  },
  filterSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    zIndex: 100,
  },
  cardContainer: {
    // Center the card visually if desired, or just let it sit at top
    // Image shows it with significant top margin or just following filter
    // EmptyStateCard itself has padding, so just placing it is fine.
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
});
