import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/styles';
import AvatarIcon from '@/assets/Icon/IconMenu/Avatar.svg';

interface GeneralInformationProps {
    data: {
        name: string;
        phone: string;
        email: string;
        role: string;
        level: string;
    };
    avatarUri?: string | null;
    onChangePhoto?: () => void;
}

export const GeneralInformation: React.FC<GeneralInformationProps> = ({
    data,
    avatarUri,
    onChangePhoto,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Thông tin chung</Text>
            </View>
            <View style={styles.headerDivider} />

            <View style={styles.formContent}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                        ) : (
                            <AvatarIcon width={80} height={80} />
                        )}
                    </View>
                    <TouchableOpacity onPress={onChangePhoto}>
                        <Text style={styles.changePhotoText}>Đổi ảnh</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Form Fields */}
                <InfoRow label="Tên:" value={data.name} />
                <InfoRow label="Số điện thoại:" value={data.phone} />
                <InfoRow label="Email:" value={data.email} />
                <InfoRow label="Chức vụ" value={data.role} />
                <InfoRow label="Cấp quản lý" value={data.level} />
            </View>
        </View>
    );
};

// Helper Component for Info Row (Local to this file or could be shared)
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginTop: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
    },
    sectionTitle: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '700',
        color: colors.text,
    },
    formContent: {
        paddingBottom: 24,
        paddingHorizontal: 16,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.gray[300], // Placeholder color
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden', // Ensure image clips to circle
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    changePhotoText: {
        color: colors.blue[600],
        fontSize: 14,
        fontWeight: '400',
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    value: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'right',
    },
    headerDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 16,
    },
});
