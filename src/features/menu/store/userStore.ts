import { create } from 'zustand';

interface UserState {
    name: string;
    phone: string;
    email: string;
    role: string;
    level: string;
    avatarUri: string | null;
    setUserInfo: (info: Partial<Omit<UserState, 'setUserInfo' | 'reset'>>) => void;
    reset: () => void;
}

export const useUserStore = create<UserState>(set => ({
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    email: 'nguyenvana@gmail.com',
    role: 'Quản lý',
    level: 'Quản lý trại',
    avatarUri: null,
    setUserInfo: info => set(state => ({ ...state, ...info })),
    reset: () =>
        set({
            name: 'Nguyễn Văn A',
            phone: '0123456789',
            email: 'nguyenvana@gmail.com',
            role: 'Quản lý',
            level: 'Quản lý trại',
            avatarUri: null,
        }),
}));
