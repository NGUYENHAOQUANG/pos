import { InformationFormValues } from '../schemas/informationFormSchema';
import { UserProfileData } from '../hooks/useUserProfile';

export const informationService = {
    mapDetailToForm: (detail: UserProfileData | null): InformationFormValues => {
        if (!detail) {
            return {
                name: '',
                email: '',
                address: '',
                phone: '',
                role: '',
                level: '',
            };
        }

        return {
            name: detail.name || '',
            email: detail.email || '',
            address: detail.address || '',
            phone: detail.phone || '',
            role: detail.role || '',
            level: detail.level || '',
        };
    },

    mapFormToPayload: (formData: InformationFormValues, avatarId?: string) => {
        return {
            fullName: formData.name,
            email: formData.email,
            address: formData.address || '',
            avatarId: avatarId || undefined,
        };
    },
};
