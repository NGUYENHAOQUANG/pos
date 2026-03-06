import { View, Text, StyleSheet } from 'react-native';
import { PondTypeTag } from '@/features/farm/components/pond/PondTypeTag';
import { MoreButton } from '@/shared/components/buttons/MoreButton';
import { colors, spacing } from '@/styles';
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

const styles = StyleSheet.create({
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
        color: colors.text,
        marginBottom: 2,
    },
    areaText: {
        fontSize: 13,
        color: colors.textSecondary,
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
