import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { PondTypeTag } from '@/features/farm/components/pond/PondTypeTag';
import { MoreButton } from '@/shared/components/buttons/MoreButton';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { PondType } from '@/features/farm/types/farm.types';

interface ShrimpPondHeaderProps {
    name: string;
    area: string;
    displayType: PondType;
    buttonRef: React.RefObject<View | null>;
    onMenuPress: () => void;
}

export const ShrimpPondHeader: React.FC<ShrimpPondHeaderProps> = ({
    name,
    area,
    displayType,
    buttonRef,
    onMenuPress,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.header}>
            <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{name}</Text>
                <Text style={styles.areaText}>
                    {area ? `${parseInt(area.toString().replace(/[^0-9.]/g, ''), 10)} m²` : ''}
                </Text>
            </View>
            <View style={styles.headerRight}>
                <PondTypeTag type={displayType} style={styles.tag} />
                <View ref={buttonRef} collapsable={false}>
                    <MoreButton onPress={onMenuPress} style={styles.menuBtn} />
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        header: {
            flexDirection: 'row',
            padding: spacing.md,
            alignItems: 'center',
        },
        infoContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        pondIcon: {
            marginRight: spacing.sm,
        },
        nameText: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.text,
            marginBottom: 2,
        },
        areaText: {
            fontSize: 13,
            color: theme.textSecondary,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: spacing.sm,
        },
        tag: {
            marginRight: spacing.sm,
            alignSelf: 'center',
        },
        menuBtn: {
            width: 32,
            height: 32,
        },
    });
