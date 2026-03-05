import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/styles';
import AvatarIcon from '@/assets/Icon/IconMenu/AvatarNew.svg';

interface GeneralInformationProps {
    data: {
        name: string;
        phone: string;
        email: string;
        role: string;
        level: string;
        address: string;
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
            <Text style={styles.sectionTitle}>Thông tin chung</Text>

            <View style={styles.cardContainer}>
                {/* Avatar Row */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                        ) : (
                            <AvatarIcon width={64} height={64} />
                        )}
                    </View>
                    {onChangePhoto && (
                        <TouchableOpacity onPress={onChangePhoto}>
                            <Text style={styles.changePhotoText}>Đổi ảnh</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Form Fields grouped to prevent 32px gap from affecting them */}
                <View style={styles.formFieldsWrapper}>
                    <InputField label="Tên" value={data.name} required placeholder="Nguyễn Văn A" />
                    <InputField
                        label="Số điện thoại"
                        value={data.phone}
                        required
                        placeholder="0908 123 456"
                    />
                    <InputField
                        label="Email"
                        value={data.email}
                        required
                        placeholder="email@gmail.com"
                    />
                    <InputField
                        label="Chức vụ"
                        value={data.role}
                        required
                        placeholder="{chức vụ}"
                    />
                    <InputField
                        label="Cấp quản lý"
                        value={data.level}
                        required
                        placeholder="{cấp quản lý}"
                    />
                </View>
            </View>
        </View>
    );
};

// Helper Component for Form Input Field
const InputField: React.FC<{
    label: string;
    value: string;
    required?: boolean;
    placeholder?: string;
}> = ({ label, value, required, placeholder }) => (
    <View style={styles.inputWrapper}>
        <View style={styles.labelWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </View>
        <View style={styles.inputBox}>
            <Text style={[styles.inputValue, !value && styles.placeholderValue]}>
                {value || placeholder}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '600',
        color: colors.gray[950],
    },
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray[200],
        padding: 12,
        gap: 24,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    changePhotoText: {
        color: colors.blue[600],
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    formFieldsWrapper: {
        gap: 16,
    },
    inputWrapper: {
        gap: 6,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        color: colors.gray[950],
    },
    requiredAsterisk: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        color: colors.volcano[600],
    },
    inputBox: {
        height: 44,
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    inputValue: {
        fontSize: 14,
        color: colors.gray[950],
    },
    placeholderValue: {
        color: colors.gray[400],
    },
});
